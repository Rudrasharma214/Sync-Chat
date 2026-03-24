const isDev = import.meta.env.MODE === 'development';

function log(level, payload) {
    if (!isDev && level === 'debug') return;

    const prefix = `[${level.toUpperCase()}]`;
    const source = payload.source ? `[${payload.source}]` : '';

    console[level](`${prefix}${source} ${payload.message}`, payload.data ?? '');
}

export const logger = {
    debug: (message, data, source) =>
        log('debug', { message, data, source }),

    info: (message, data, source) =>
        log('info', { message, data, source }),

    warn: (message, data, source) =>
        log('warn', { message, data, source }),

    error: (message, data, source) =>
        log('error', { message, data, source }),
};
