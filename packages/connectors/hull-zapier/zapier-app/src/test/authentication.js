require('should');

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('App.authentication.test', () => {
  it('passes authentication and returns json', done => {
    const bundle = {
      authData: {
        apiKey: process.env.HULL_TEST_TOKEN
      }
    };

    appTester(App.authentication.test, bundle)
      .then(response => {
        response.should.have.property('status');
        response.status.should.eql('ok');
        done();
      })
      .catch(err => {
        console.log(err, err.message);
        done();
      });
  }).timeout(5000);
});
