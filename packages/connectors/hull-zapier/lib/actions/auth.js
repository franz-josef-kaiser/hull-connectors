"use strict";

module.exports = function ({ hostSecret, connector }) {
  return function (req, res) {
    console.log(req);
    res.send({ ok: "ok" });
  };
};