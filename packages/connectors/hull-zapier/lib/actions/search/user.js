"use strict";

const fp = require("lodash/fp");

const BLACKLIST = ["accepts_marketing", "has_password", "is_approved", "has_password", "identities_count", "indexed_at", "is_approved", "main_identity", "shopify_connected_at", "shopify_id", "google_connected_at", "google_id", "facebook_connected_at", "facebook_id", "github_connected_at", "github_id"];

const blacklisted = fp.includes(fp, BLACKLIST);
const filter = client => fp.flow(client.utils.traits.group, fp.omitBy((v, k) => blacklisted(k) || k.match(/^[a-z0-9]{24}_/)));

const formatReport = (client, report) => {
  const { account = {}, segments = {} } = report;
  const user = filter(client)(report);
  return user;
};

module.exports = function ({ hostSecret, connector }) {
  return function (req, res) {
    const { client } = req.hull || {};
    const { email } = req.body || {};
    if (!client) return res.send(404);
    client.asUser({ email }, { create: false }).get("/me/user_report").then(report => res.send([formatReport(client, report)])).catch(err => {
      console.log(err);
      res.sendStatus(404);
    });
  };
};