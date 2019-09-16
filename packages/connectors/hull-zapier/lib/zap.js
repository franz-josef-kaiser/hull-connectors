'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = zap;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function zap({ zap_urls, hull, payload = {} }) {
  return _lodash2.default.map(zap_urls, url => _axios2.default.post(url, payload).then(({ data, status, statusText }) => hull.logger.info('zap.success', {
    userId: payload.user.id,
    status,
    statusText,
    data
  })).catch(({ response, message: msg }) => {
    if (response) {
      const { data, status } = response;
      hull.logger.info('zap.error', { message: 'zap failed', data, status });
    } else {
      // Something happened in setting up the request that triggered an Error
      hull.logger.error('zap.error', { message: msg });
    }
  }));
}