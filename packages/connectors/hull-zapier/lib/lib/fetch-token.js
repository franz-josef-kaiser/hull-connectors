"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchToken;
function fetchToken(req, res, next) {
  req.hull = req.hull || {};
  const token = req.query.api_key;
  if (!token) return res.sendStatus(400);
  req.hull.token = token;
  return next();
}