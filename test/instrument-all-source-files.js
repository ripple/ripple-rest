// Require all important source files so they 
// are included in the code coverage statistics
var requireDirectory = require('require-directory');
requireDirectory(module, __dirname + '/../api');
requireDirectory(module, __dirname + '/../db');
requireDirectory(module, __dirname + '/../lib');
require('../server');