import pakke from '../package.json';

const projectName = pakke.name;
const serializers = {
    req: (req) => {
        return {
            method: req.method,
            url: req.url,
        };
    },
    res: (res) => {
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
        servers: [`mongodb://localhost/${pakke.name}`],
        replset: null,
    },
    express: {
        port: 3000,
        trust_proxy: true, // false in development
        session: {
            secret: '$session$ecret',
            name: `${pakke.name}.sid`,
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
        serializers,
        level: 'info',
        name: projectName,
    },
    'bunyan-express': {
        excludes: [
            'body',
            'http-version',
            'req-headers',
            'res-headers',
        ],
        format: ':remote-address :incoming :method :url HTTP/:http-version :status-code :res-headers[content-length] :referer :user-agent[family] :user-agent[major].:user-agent[minor] :user-agent[os] :response-time ms',
    },
    graphql: {
        name: pakke.name,
        version: pakke.version,
        pretty: false,
        graphiql: false,
    },
};

/** EXAMPLE DEV SETTINGS **
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
