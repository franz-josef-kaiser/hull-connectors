"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (opts) {
  const router = _express2.default.Router();

  router.get("/", (req, res) => {
    if (req.hull) {
      const { organization, ship, secret } = req.hull.config;
      if (organization && ship && secret) return res.send("OK");
    }
    return res.sendStatus(400);
  });

  router.post("/track", (req, res) => {
    const { email, event, properties = {} } = req.body || {};
    req.hull.client.as({ email }).track(event, properties);
    res.send("OK");
  });

  router.post("/trait", (req, res) => {
    const { email, properties = {} } = req.body || {};
    req.hull.client.as({ email }).traits(properties);
    res.send("OK");
  });

  router.get("/track_fields", (req, res) => {
    res.send("OK");
  });
  router.get("/trait_fields", (req, res) => {
    res.send("OK");
  });

  return router;
};

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }