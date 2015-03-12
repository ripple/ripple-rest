'use strict';
var packageJson = require('../package.json');

function getPackageVersion() {
  return packageJson.version;
}

function getApiVersion() {
  var pattern = /([0-9])(?:\.)/g;
  return pattern.exec(getPackageVersion())[1];
}

module.exports.getPackageVersion = getPackageVersion;
module.exports.getApiVersion = getApiVersion;
