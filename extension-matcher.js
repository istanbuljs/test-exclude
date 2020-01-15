'use strict';

if (process.platform === 'win32') {
    module.exports = require("./extension-matcher-win32");
} else {
    module.exports = require("./extension-matcher-posix");
}

