'use strict'

module.exports = (filename) => {
    return ext => filename.toLowerCase().endsWith(ext.toLowerCase());
};
