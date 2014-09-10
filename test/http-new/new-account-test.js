var supertest = require('supertest');
var server = require('./../../lib/app.js');

var app;

before(function() {
	app = supertest(server);
});

describe('Wallet Generation', function() {
	it('should fail to create a new wallet', function(done) {
		app
		.get('/v1/new')
		.expect('Content-Type', /json/)
		.expect(200)
		.expect(function(res, error) {
			if (res.body.success) return 'Success was true';
      if (res.body.error_type !== 'connection_error') return 'Error type was not connection error';
		})
    .end(done);
	});
});