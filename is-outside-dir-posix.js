'use strict';

const path = require('path');

module.exports = {
    isOutsideDir(dir, filename) {
        return /^\.\./.test(path.relative(dir, filename));
    },
    minimatchOptions: {
        dot: true
    }
};
