'use strict';
var _ = require('lodash');

var SEED = '3045022100A58B0460BC5092CB4F96155C19125A4E079C870663F1D5E8BBC9BD0';

function PRNGMock(seed) {
  if (seed && seed.length < 8) {
    throw new Error('seed must be a hex string of at least 8 characters');
  }
  this.position = 0;
  this.seed = seed || SEED;
}

PRNGMock.prototype.randomWord = function() {
  var i = this.position;
  this.position = (i + 8) % this.seed.length;
  var data = this.seed + this.seed.slice(8);
  return parseInt(data.slice(i, i + 8), 16);
};

PRNGMock.prototype.randomWords = function(n) {
  var self = this;
  return _.times(n, function() {
    return self.randomWord();
  });
};

module.exports = PRNGMock;
