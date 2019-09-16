"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (opts) {
  const router = _express2.default.Router();

  // POLL GET https://zapier.eu.ngrok.io/zapier/trigger/users
  // POLL GET https://zapier.eu.ngrok.io/zapier/trigger/users_fields

  router.get("/test", (req, res) => {
    if (req.hull) {
      const { organization, ship, secret } = req.hull.config;
      if (organization && ship && secret) return res.send("OK");
    }
    return res.sendStatus(400);
  });

  router.get("/users", (req, res) => {
    const { hull } = req;
    (0, _fetchUsers2.default)({
      hull: hull.client,
      search: {},
      multi: true,
      events: true
    }).then(user => res.send(user), err => console.log(err));
  });

  router.get("/users_fields", (req, res) => {
    const { hull } = req;
    (0, _fetch.attributes)({ hull: hull.client }).then(fields => res.send(fields));
  });

  router.post("/subscribe", (req, res) => {
    const { client, ship } = req.hull;
    const { zap_urls = [] } = ship.private_settings;
    zap_urls.push(req.body.target_url);
    const settings = {
      private_settings: Object.assign({}, ship.private_settings, {
        zap_urls: _lodash2.default.uniq(zap_urls)
      })
    };
    client.put(ship.id, settings).then(() => res.send("OK"), () => res.sendStatus(400));
  });

  router.post("/unsubscribe", (req, res) => {
    const { client, ship } = req.hull;
    const { zap_urls = [] } = ship.private_settings;
    const settings = {
      private_settings: Object.assign({}, ship.private_settings, {
        zap_urls: _lodash2.default.uniq(_lodash2.default.without(zap_urls, req.body.target_url))
      })
    };
    client.put(ship.id, settings).then(() => res.send("OK"), () => res.sendStatus(400));
  });

  return router;
};

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _fetch = require("../hull/fetch");

var _fetchUsers = require("../hull/fetch-users");

var _fetchUsers2 = _interopRequireDefault(_fetchUsers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }