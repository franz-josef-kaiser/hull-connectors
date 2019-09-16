const should = require('should'); // required to use .exist()

const zapier = require('zapier-platform-core');

const App = require('../index');

const appTester = zapier.createAppTester(App);

describe('searches', () => {
  describe('search user', () => {
    it('should find a user', done => {
      const bundle = {
        inputData: {
          email: 'gavin@hooli.com'
        }
      };

      appTester(App.searches.user.operation.perform, bundle)
        .then(results => {
          results.length.should.be.aboveOrEqual(1);
          const firstUser = results[0];
          firstUser.user.name.should.eql('Gavin Belson');
          firstUser.user.email.should.eql('gavin@hooli.com');
          done();
        })
        .catch(done);
    }).timeout(5000);
  });
});
