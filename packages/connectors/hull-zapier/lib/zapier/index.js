"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function ({ hullClient, hostSecret }) {
  const router = _express2.default.Router();

  router.use(_fetchToken2.default);
  router.use(_bodyParser2.default.json());
  router.use(_bodyParser2.default.urlencoded({ extended: true }));
  router.use(hullClient({ hostSecret }));

  router.use('/trigger', (0, _trigger2.default)({ hullClient, hostSecret }));
  router.use('/search', (0, _search2.default)({ hullClient, hostSecret }));
  router.use('/action', (0, _action2.default)({ hullClient, hostSecret }));

  return router;
};

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _fetchToken = require("../lib/fetch-token");

var _fetchToken2 = _interopRequireDefault(_fetchToken);

var _trigger = require("./trigger");

var _trigger2 = _interopRequireDefault(_trigger);

var _search = require("./search");

var _search2 = _interopRequireDefault(_search);

var _action = require("./action");

var _action2 = _interopRequireDefault(_action);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }