# LSApplicationQueriesSchemes for Cordova

[![Build Status](https://travis-ci.org/adriano-di-giovanni/cordova-plugin-LSApplicationQueriesSchemes.svg?branch=master)](https://travis-ci.org/adriano-di-giovanni/cordova-plugin-LSApplicationQueriesSchemes)

> This plugin dynamically specifies the URL schemes the app is able to test using the `canOpenURL:` method of the `UIApplication` class.

## Installation

```bash
cordova plugin add cordova-plugin-lsapplicationqueriesschemes
```

## Usage

The plugin merges and keeps synchronized the URL schemes from the `*-Info.plist` and the `LSApplicationQueriesSchemes.json` files.

Merging and synchronization happens upon `cordova prepare`.

The `LSApplicationQueriesSchemes.json` file is created inside the project root upon plugin installation.

### How to add or edit an URL scheme

Add or edit an URL scheme as follows:

* edit the `LSApplicationQueriesSchemes.json` file;
* run `cordova prepare`.

### How to remove an URL scheme

Remove an URL scheme as follows:

* edit both `LSApplicationQueriesSchemes.json` and `*-Info.plist` file.

## Supported platforms

* iOS

## License

This project is [MIT-licensed](https://github.com/adriano-di-giovanni/cordova-plugin-enable-multidex/blob/master/LICENSE).
