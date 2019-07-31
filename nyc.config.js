'use strict';

const defaultExclude = require('./default-exclude');

const isWindows = process.platform === 'win32';

module.exports = {
    all: true,
    checkCoverage: true,
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
    exclude: [
        ...defaultExclude,
        'is-outside-dir.js',
        isWindows ? 'is-outside-dir-posix.js' : 'is-outside-dir-win32.js'
    ]
};
