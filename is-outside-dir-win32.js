'use strict';

const path = require('path');
const minimatch = require('minimatch');
const minimatchOptions = {
    dot: true,
    nocase: true // win32 should be case insensitive matches
};

module.exports = {
    isOutsideDir(dir, filename) {
        return !minimatch(path.resolve(dir, filename), path.join(dir, '**'), minimatchOptions)
    },
    minimatchOptions
}
