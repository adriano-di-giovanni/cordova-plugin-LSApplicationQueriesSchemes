/**
 * Asynchronously merges URL schemes from the `LSApplicationQueriesSchemes.json` file with the
 * URL schemes from the key `LSApplicationQueriesSchemes` of the `*-Info.plist` file.
 * Synchronizes the two sources.
 */
module.exports = function applyPlugin(context) {
    var fs = context.requireCordovaModule('fs')
    var path = context.requireCordovaModule('path')
    var plist = context.requireCordovaModule('plist')
    var Q = context.requireCordovaModule('q')
    var xml = context.requireCordovaModule('cordova-common').xmlHelpers

    return Q.all([Q.nfcall(readPropertyListFile), Q.nfcall(readURLSchemeFile)])
        .spread(function(propertyList, urlSchemes) {
            if (!isArray(propertyList.LSApplicationQueriesSchemes)) {
                propertyList.LSApplicationQueriesSchemes = []
            }
            propertyList.LSApplicationQueriesSchemes = propertyList.LSApplicationQueriesSchemes.concat(
                urlSchemes
            ).filter(unique)

            return propertyList
        })
        .then(function(propertyList) {
            return Q.all([
                Q.nfcall(writeURLSchemeFile, propertyList.LSApplicationQueriesSchemes),
                Q.nfcall(writePropertyListFile, propertyList),
            ])
        })

    /**
     * Asynchronously reads the `*-Info.plist` file into a JSON object
     *
     * @param {Function} done The callback. Invoked with `(err, propertyList)`
     */
    function readPropertyListFile(done) {
        var filepath = getPropertyListFilePath()
        var callback = function(err, data) {
            if (err) {
                done(err)
                return
            }
            done(null, plist.parse(data))
        }
        fs.readFile(filepath, 'utf8', callback)
    }

    /**
     * Asynchronously reads the LSApplicationQueriesSchemes.json file into a JSON array.
     * Returns an empty array if the file doesn't exist.
     *
     * @param {Function} done The callback. Invoked with `(err, urlSchemes)`
     */
    function readURLSchemeFile(done) {
        var filepath = getURLSchemeFilePath()
        var callback = function(err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    done(null, [])
                } else {
                    done(err)
                }
                return
            }

            parseJSON(data, function(err, value) {
                if (err) {
                    done(err)
                    return
                }

                if (!isArray(value) || !value.every(isString)) {
                    done(
                        new TypeError(
                            "Missing or invalid value for the 'LSApplicationQueriesSchemes' key. Array of strings expected."
                        )
                    )
                    return
                }

                done(null, value)
            })
        }
        fs.readFile(filepath, 'utf8', callback)
    }

    /**
     * Asynchronously writes the `urlSchemes` JSON array to `LSApplicationQueriesSchemes.json` file
     *
     * @param {Array.<String>} urlSchemes The URL schemes
     * @param {Function} callback The callback. Invoked with `(err)`
     */
    function writeURLSchemeFile(urlSchemes, callback) {
        var filepath = getURLSchemeFilePath()
        fs.writeFile(filepath, JSON.stringify(urlSchemes), callback)
    }

    /**
     * Asynchronously writes the `propertyList` JSON object to the `*-Info.plist` file
     *
     * @param {Object} propertyList The property list
     * @param {Function} callback The callback. Invoked with `(err)`
     */
    function writePropertyListFile(propertyList, callback) {
        var filepath = getPropertyListFilePath()
        fs.writeFile(filepath, plist.build(propertyList), callback)
    }

    /**
     * Returns the path to the property list file
     *
     * @returns {String} The path to the property list file
     */
    function getPropertyListFilePath() {
        var projectName = getProjectName(context)
        var filename = projectName + '-Info.plist'
        return path.join(context.opts.projectRoot, 'platforms/ios', projectName, filename)
    }

    /**
     * Returns the project name
     *
     * @returns {String} The project name
     */
    function getProjectName() {
        return readConfigFileSync()
            .getroot()
            .find('name')
            .text.trim()
    }

    /**
     * Synchronously reads the project's `config.xml` into an XML ElementTree
     *
     * @returns The ElementTree instance
     * @see {@link https://github.com/racker/node-elementtree}
     */
    function readConfigFileSync() {
        return xml.parseElementtreeSync(path.join(context.opts.projectRoot, './config.xml'))
    }

    /**
     * Returns the path to the `LSApplicationQueriesSchemes.json` file.
     *
     * @returns {String} The path to the `LSApplicationQueriesSchemes.json` file
     */
    function getURLSchemeFilePath() {
        return path.join(context.opts.projectRoot, 'LSApplicationQueriesSchemes.json')
    }
}

var toString = Object.prototype.toString

function isArray(value) {
    return /^\[object Array\]$/.test(toString.call(value))
}

function isString(value) {
    return /^\[object String\]$/.test(toString.call(value))
}

function parseJSON(text, done) {
    // wrap `done` callback to invoke it asynchronously
    // in order to avoid its code to be executed inside try/catch block
    var callback = function(err, data) {
        setImmediate(function() {
            done(err, data)
        })
    }

    try {
        callback(null, JSON.parse(text))
    } catch (err) {
        callback(err)
    }
}

function unique(element, index, array) {
    return array.indexOf(element) === index
}
