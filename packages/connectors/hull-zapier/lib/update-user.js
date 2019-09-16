'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = updateUser;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _zap = require('./zap');

var _zap2 = _interopRequireDefault(_zap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSegmentChanges(zap_segments, changes = {}, action = 'left') {
  const { segments = {} } = changes;
  if (!_lodash2.default.size(segments)) return [];
  const current = segments[action] || [];
  if (!current.length) return [];

  // Get list of segments we're validating against for a given changeset
  const filter = _lodash2.default.map(_lodash2.default.filter(zap_segments, e => e[action]), 'segment');

  // List of User segments matching entered or left
  return _lodash2.default.filter(current, s => _lodash2.default.includes(filter, s.name));
}

function updateUser({ message = {} }, { ship = {}, hull = {}, isBatch = false }) {
  const { user = {}, segments = [], changes = {}, events = [] } = message;
  const { private_settings = {} } = ship;
  const { zap_urls = [], segment_filter = [], zap_events = [], zap_attributes = [], zap_segments = [] } = private_settings;

  hull.logger.info('notification.start', { userId: user.id });

  if (!user || !user.id || !ship || !zap_urls.length || !segment_filter) {
    hull.logger.error('notification.error', {
      message: "Missing data",
      user: !!user,
      ship: !!ship,
      userId: user && !!user.id,
      zap_url: !!zap_urls
    });
    return false;
  }

  if (!segment_filter.length) {
    hull.logger.info('notification.skip', { message: 'No Segments configured. all Users will be skipped' });
    return false;
  }

  if (!zap_events.length && !zap_segments.length && !zap_attributes.length) {
    hull.logger.info('notification.skip', { message: 'No Events, Segments or Attributes configured. No zaps will be sent' });
    return false;
  }

  // pluck
  const segmentIds = _lodash2.default.map(segments, 'id');

  // Early return when sending batches. All users go through it. No changes, no events though...
  if (isBatch) {
    (0, _zap2.default)({
      hull,
      zap_urls,
      payload: { user, segments }
    });
    return false;
  }

  if (!_lodash2.default.intersection(segment_filter, segmentIds).length) {
    hull.logger.info('notification.skip', { message: "User doesn't match filtered segments" });
    return false;
  }

  const filteredSegments = _lodash2.default.intersection(segment_filter, segmentIds);
  const matchedAttributes = _lodash2.default.intersection(zap_attributes, _lodash2.default.keys(changes.user || {}));
  const matchedEnteredSegments = getSegmentChanges(zap_segments, changes, 'entered');
  const matchedLeftSegments = getSegmentChanges(zap_segments, changes, 'left');
  const matchedEvents = _lodash2.default.filter(events, event => _lodash2.default.includes(zap_events, event.event));

  // Payload
  const payload = {
    user,
    segments,
    changes
  };

  const loggingContext = {
    matchedEvents,
    matchedAttributes,
    filteredSegments,
    matchedEnteredSegments,
    matchedLeftSegments
  };

  // Event zaps: Zap once for each matching event.
  if (matchedEvents.length) {
    _lodash2.default.map(matchedEvents, event => {
      hull.logger.info('notification.send', loggingContext);
      (0, _zap2.default)({ hull, zap_urls, payload: Object.assign({}, payload, { event }) });
    });
    return true;
  }

  // User Zaps
  // Don't send again if already sent through events.
  if (matchedAttributes.length || matchedEnteredSegments.length || matchedLeftSegments.length) {
    hull.logger.info('notification.send', loggingContext);
    (0, _zap2.default)({ hull, zap_urls, payload });
    return true;
  }

  hull.logger.info('notification.skip', { userId: user.id, message: "User didn't match any conditions" });
  return false;
}