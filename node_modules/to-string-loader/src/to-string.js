/**
 * @see https://github.com/webpack/webpack/wiki/Loader-Specification
 */
module.exports = function (content) {
    this.cacheable();
    return 'module.exports = ' + JSON.stringify(this.exec(content, this.resource).toString());
};
