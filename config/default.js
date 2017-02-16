const path = require('path');

const project_name = 'punchy';

const serializers = {
    req: function(req) {
        return {
            method: req.method,
            url: req.url,
        };
    },
    res: function(res) {
        return {
            statusCode: res.statusCode,
        };
    },
};

module.exports = {
    html: {
        style: true,
    },
    mongodb: {
        servers: ['mongodb://localhost/' + project_name],
        replset: null,
    },
    express: {
        port: 3000,
        trust_proxy: true, // false in development
        session: {
            secret: '$session$ecret',
            name: project_name + '.sid',
            httpOnly: true,
            secure: true, // false in development
            domain: 'example.com',
            path: '/',
            // expire after 24 hours
            maxAge: 1000 * 60 * 60 * 24,
            resave: false,
            rolling: false,
            saveUninitialized: false,
        },
    },
    auth: {
        google: {
            clientId: '',
            clientSecret: '',
            callbackURL: '',
        },
    },
    bunyan: {
        level: 'info',
        name: project_name,
        serializers: serializers,
    },
    'bunyan-express' : {
        excludes: [
            'body',
            'http-version',
            'req-headers',
            'res-headers',
        ],
        format: ":remote-address :incoming :method :url HTTP/:http-version :status-code :res-headers[content-length] :referer :user-agent[family] :user-agent[major].:user-agent[minor] :user-agent[os] :response-time ms",
    },
    graphql: {
        pretty: false,
        graphiql: false,
    },
};

/*** EXAMPLE DEV SETTINGS ***
module.exports = {
    html: {
        style: false,
    },
    express: {
        trust_proxy: false,
        session: {
            domain: 'localhost',
            secure: false,
        },
    },
    bunyan: {
        level: 'debug',
    },
    graphql: {
        pretty: true,
        graphiql: true,
    },
    'bunyan-express' : {
        excludes: [
            'body',
            'http-version',
            'req-headers',
            'res-headers',
            'response-hrtime',
            'user-agent',
        ],
        format: function(){ return ""; },
    },
};
*/
