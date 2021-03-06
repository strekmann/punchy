/* remember that file paths need to be full, or it will only work in dev, not in prod */

module.exports = {
    uri: 'http://localhost:3000/',
    sessionSecret: 'sessionSecretString',
    trust_proxy: false,
    useBunyan: false,
    auth: {
        google: {
            clientId: 'googleClientId',
            clientSecret: 'googleCLientSecret',
            callbackURL: 'http://localhost:3000/auth/google/callback'
        }
    },
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    mongo: {
        servers: ['mongodb://localhost/boilerplate'],
        replset: null
    },
    locales: ['en', 'nb'],
    defaultLocale: 'en'
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
