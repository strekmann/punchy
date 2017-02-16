export function base64(string) {
    return new Buffer(string, 'utf8').toString('base64');
}

export function unbase64(string) {
    return new Buffer(string, 'base64').toString('utf8');
}
