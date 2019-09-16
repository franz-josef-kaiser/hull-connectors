"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.middleware = middleware;

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _querystring = require("querystring");

var _querystring2 = _interopRequireDefault(_querystring);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const algorithm = "aes-128-cbc";

function encrypt(text, password) {
  const cipher = _crypto2.default.createCipher(algorithm, password);
  let crypted = cipher.update(_querystring2.default.stringify(text), "utf8", "base64");
  crypted += cipher.final("base64");
  return encodeURIComponent(crypted);
}

function decrypt(text, password) {
  const decipher = _crypto2.default.createDecipher(algorithm, password);
  let dec = decipher.update(decodeURIComponent(text), "base64", "utf8");
  dec += decipher.final("utf8");
  return _querystring2.default.parse(dec);
}

function middleware(secret) {
  return function (req, res, next) {
    console.log(req.query, secret);
    if (req.query) {
      const { token, api_key } = req.query;
      req.hull = req.hull || {};
      req.hull.config = decrypt(token || api_key, secret);
    }
    next();
  };
}