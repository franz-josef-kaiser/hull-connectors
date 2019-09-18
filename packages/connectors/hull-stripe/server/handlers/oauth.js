const { oAuthHandler } = require("hull/lib/utils");
const { Strategy: StripeStrategy } = require("passport-stripe");
const Promise = require("bluebird");
const _ = require("lodash");
const moment = require("moment");
const Stripe = require("stripe");

const fetchHistory = require("../lib/fetch-history");
const crypt = require("../lib/crypt");

function oAuth({ clientId, clientSecret, instrumentationAgent }) {
  return oAuthHandler({
    tokenInUrl: false,
    name: "Stripe",
    Strategy: StripeStrategy,
    options: {
      clientID: clientId,
      clientSecret,
      scope: ["read_only"],
      stripe_landing: "login"
    },
    isSetup(req) {
      const { client: hull, ship, hostSecret } = req.hull;
      if (req.query.reset) return Promise.reject();
      const { private_settings = {} } = ship;
      const { token, stripe_user_id } = private_settings;

      let uid;
      try {
        uid = crypt.decrypt(stripe_user_id, hostSecret);
      } catch (e) {
        return Promise.reject(new Error("Couldn't decrypt Stripe User ID"));
      }

      // Early Return
      if (!token || !uid) {
        return Promise.reject(new Error("No token or UID"));
      }

      return hull
        .get(ship.id)
        .then(s => {
          const now = parseInt(new Date().getTime() / 1000, 0);
          const then = now - 3600; // one hour ago
          const query = `ship.incoming.events{ship:${ship.id}}`;

          let metric;
          if (
            instrumentationAgent &&
            process.env.DATADOG_API_KEY &&
            process.env.DATADOG_APP_KEY
          ) {
            instrumentationAgent.dogapi.initialize({
              api_key: process.env.DATADOG_API_KEY,
              app_key: process.env.DATADOG_APP_KEY
            });
            metric = Promise.fromCallback(cb =>
              instrumentationAgent.dogapi.metric.query(then, now, query, cb)
            );
          } else {
            metric = Promise.resolve();
          }
          const cache = req.hull.cache.cache.set(
            stripe_user_id,
            req.hull.token,
            { ttl: 10080000 }
          );

          const account = Promise.fromCallback(cb =>
            Stripe(clientSecret).account.retrieve(uid, cb)
          );

          return Promise.all([metric, account, cache]).then(
            ([events = {}, accnt = {}]) => {
              const { business_name = "", business_logo = "" } = accnt;
              return {
                error: null,
                business_name,
                business_logo,
                settings: s.private_settings,
                hostname: req.hostname,
                token: req.hull.token,
                events: _.get(events, "series[0].pointlist", []).map(p => p[1])
              };
            }
          );
        })
        .catch(err => {
          hull.logger.error("isSetup.error", err);
          return {
            error: err.message
          };
        });
    },
    onLogin: req => {
      req.authParams = { ...req.body, ...req.query };
      return Promise.resolve();
    },
    onAuthorize: req => {
      const { account, hull } = req;
      const { profile = {}, refreshToken, accessToken } = account;
      const { stripe_user_id, stripe_publishable_key } = profile;
      const newShip = {
        refresh_token: refreshToken,
        token: accessToken,
        // Store it in an encrypted form so we're not vulnerable to identity theft
        stripe_user_id: crypt.encrypt(stripe_user_id, req.hull.hostSecret),
        stripe_publishable_key,
        token_fetched_at: moment()
          .utc()
          .format("x")
      };
      req.hull.stripe = Stripe(accessToken);

      // call-and-forget, keeping that function in chain makes the whole operation
      // a lot slower
      fetchHistory(req.hull);
      return hull.helpers.updateSettings(newShip);
    },
    views: {
      login: "login.html",
      home: "home.html",
      failure: "failure.html",
      success: "success.html"
    }
  });
}

module.exports = oAuth;
