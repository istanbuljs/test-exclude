'use-strict'

module.exports = (filename) => {
    return ext => filename.endsWith(ext);
};
