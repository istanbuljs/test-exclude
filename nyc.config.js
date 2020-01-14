'use strict';

const defaultExclude = require('@istanbuljs/schema/default-exclude.js');

const isWindows = process.platform === 'win32';

module.exports = {
    all: true,
    checkCoverage: true,
    lines: 100,
    functions: 100,
    branches: 100,
    statements: 100,
    exclude: [
        ...defaultExclude,
        'is-outside-dir.js',
        'extension-matcher.js',
        isWindows ? 'is-outside-dir-posix.js' : 'is-outside-dir-win32.js',
        isWindows ? 'extension-matcher-posix.js' : 'extension-matcher-win32.js'
    ]
};
