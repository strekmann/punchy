#!/usr/bin/env node

/* eslint "import/newline-after-import": 0 */
/* eslint "import/first": 0 */
/* eslint no-param-reassign: ["error", { "props": false }] */

import Promise from 'bluebird';
import mongoose from 'mongoose';
mongoose.Promise = Promise;

import ReactDOMServer from 'react-dom/server';
import ReactHelmet from 'react-helmet';
import RelayLocalSchema from 'relay-local-schema';
import Router from 'isomorphic-relay-router';
// import bodyParser from 'body-parser';
import config from 'config';
import connectMongo from 'connect-mongo';
import express from 'express';
import expressBunyan from 'express-bunyan-logger';
// import fs from 'fs';
import graphqlHTTP from 'express-graphql';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import moment from 'moment';
import passport from 'passport';
import path from 'path';
import session from 'express-session';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { match } from 'react-router';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

import User from './models/user';
import Organization from './models/organization';
import log from './log';
import routes from './common/routes';
import schema from './graphql/schema';

injectTapEventPlugin();

const MongoStore = connectMongo(session);

const app = express();
app.use(helmet());
app.use(session({
    secret: config.get('express.session.secret'),
    name: config.get('express.session.name'),
    httpOnly: config.get('express.session.httpOnly'),
    domain: config.get('express.session.domain'),
    path: config.get('express.session.path'),
    resave: config.get('express.session.resave'),
    rolling: config.get('express.session.rolling'),
    saveUninitialized: config.get('express.session.saveUninitialized'),
    cookie: {
        secure: config.get('express.session.secure'),
        maxAge: config.get('express.session.maxAge'),
    },
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: config.get('express.session.maxAge') / 1000,
        touchAfter: config.get('express.session.maxAge') / 3000,
    }),
}));

const httpServer = http.createServer(app);

/* LOGGING */
const bunyanOptions = {
    logger: log,
    excludes: config.get('bunyan-express').excludes,
    format: config.get('bunyan-express').format,
};
app.use(expressBunyan(bunyanOptions));
app.use(expressBunyan.errorLogger(bunyanOptions));

/* PASSPORT */
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
    .then((user) => {
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }).catch((err) => {
        return done(err.message, null);
    });
});

passport.use(new GoogleStrategy({
    clientID: config.get('auth.google.clientId'),
    clientSecret: config.get('auth.google.clientSecret'),
    callbackURL: config.get('auth.google.callbackURL'),
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        User.findOne({ google_id: profile.id })
        .then((dbUser) => {
            if (dbUser) {
                return done(null, dbUser);
            }
            return User.create({
                username: profile.displayName,
                name: profile.displayName,
                email: profile._json.email,
                google_id: profile.id,
            }).then((user) => {
                const organization = Organization();
                organization._id = user._id;
                organization.name = user.name;
                organization.users.push(user);
                organization.save(() => {
                    return done(null, user);
                });
            }).catch((err) => {
                return done(`Could not create user: ${err}`);
            });
        }).catch((err) => {
            return done(`Could not find user: ${err}`);
        });
    });
}));

app.use(passport.initialize());
app.use(passport.session());

/* GRAPHQL ENDPOINT */
app.use('/graphql', graphqlHTTP((req) => {
    return {
        schema,
        context: { viewer: req.user },
        pretty: config.get('graphql.pretty'),
        graphiql: config.get('graphql.graphiql'),
    };
}));

/* DEFAULT */
function renderPage(renderedContent, initialState, head) {
    let style = '';
    if (config.get('html.style')) {
        style = '<link rel="stylesheet" href="/styles.css">';
    }
    return `
    <!doctype html>
    <html>
    <head>
        ${head.title.toString()}
        ${head.meta.toString()}
        ${style}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    </head>
    <body style="margin:0;">
        <div id="app">${renderedContent}</div>
        <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="/bundle.js"></script>
    </body>
    </html>
    `;
}

// app.use(bodyParser.urlencoded({extended: false}));
app.use(hpp());

app.get('/auth/google', app.passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'] }), (req, res) => {});
app.get('/auth/google/callback', app.passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    const url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
});

const universal = (req, res, next) => {
    match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
        if (err) {
            return next(err);
            // res.status(500).send(err.message);
        }
        else if (redirectLocation) {
            return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        }
        else if (renderProps) {
            moment.locale('en');

            const contextValue = {};
            if (req.user) {
                contextValue.viewer = req.user;
            }
            const networkLayer = new RelayLocalSchema.NetworkLayer({
                schema,
                contextValue,
                onError: (errors, request) => {
                    return next(new Error(errors));
                },
            });
            return Router.prepareData(renderProps, networkLayer).then(({ data, props }) => {
                try {
                    global.navigator = { userAgent: req.headers['user-agent'] };
                    const renderedContent = ReactDOMServer.renderToString(Router.render(props));
                    const head = ReactHelmet.rewind();

                    const renderedPage = renderPage(renderedContent, data, head);
                    return res.send(renderedPage);
                }
                catch (routeErr) {
                    return next(routeErr);
                }
            }, next);
        }
        return next();
    });
};

/* STATIC - production */
app.use('/', express.static(path.join(__dirname, 'static')));

app.get('/*', universal);

app.use((err, req, res, next) => {
    let status = 500;
    let message = err.message;

    switch (err.name) {
        case 'UnauthorizedError':
            status = 401;
            message = 'Invalid token';
            break;
        default:
            log.error(err, 'unhandeled error');
    }

    res.format({
        html: () => {
            res.sendStatus(status);
        },
        json: () => {
            res.status(status).json({
                error: message,
            });
        },
    });
});

app.use((req, res, next) => {
    res.format({
        html: () => {
            res.sendStatus(404);
        },
        json: () => {
            res.status(404).json({
                error: 'Not Found',
                status: 404,
            });
        },
    });
});

process.on('uncaughtException', (err) => {
    log.fatal(err);
    process.exit(1);
});

mongoose.connect(config.get('mongodb.servers').join(','), {
    replSet: {
        rs_name: config.get('mongodb.replset'),
    },
}, (err) => {
    if (err) {
        return log.error(`MongoDB: ${err.message}`);
    }
    return httpServer.listen(config.get('express.port'), () => {
        log.info('port %s, env=%s', config.get('express.port'), config.util.getEnv('NODE_ENV'));
    });
});
