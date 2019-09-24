'use strict';

const defaultExclude = require('./default-exclude');

const isWindows = process.platform === 'win32';

module.exports = {
    all: true,
    exclude: [
        ...defaultExclude,
        'is-outside-dir.js',
        isWindows ? 'is-outside-dir-posix.js' : 'is-outside-dir-win32.js'
    ]
};
