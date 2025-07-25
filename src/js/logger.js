class Logger {
    static log(...args) {
        console.log('[LOG]', ...args);
    }
    static info(...args) {
        console.info('[INFO]', ...args);
    }
    static warn(...args) {
        console.warn('[WARN]', ...args);
    }
    static error(...args) {
        console.error('[ERROR]', ...args);
    }
}

// Make Logger globally accessible if modules are not used
window.Logger = Logger;

