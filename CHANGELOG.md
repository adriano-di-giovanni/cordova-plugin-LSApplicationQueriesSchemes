# Changelog

## [1.0.1] - 2018-02-15

### Changed

* No longer require `plist` module using `context.requireCordovaModule('plist')` because recent versions of `cordova-lib` use version 2.0.1 of the module. The module corrupts `*-Info.plist` files when serializing a null string. [Issue](https://github.com/TooTallNate/plist.js/issues/79) on GitHub. Using [xiangpingmeng/plist.js](https://github.com/xiangpingmeng/plist.js) instead.
