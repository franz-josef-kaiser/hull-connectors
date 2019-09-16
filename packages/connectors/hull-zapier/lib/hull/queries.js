"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.latest = latest;
exports.id = id;
exports.email = email;
exports.events = events;
exports.eventId = eventId;
function latest() {
  return {
    query: {
      match_all: {}
    },
    sort: {
      created_at: "asc"
    },
    raw: true,
    page: 1,
    per_page: 1
  };
}

function id(query) {
  return {
    filter: {
      filtered: {
        query: { match_all: {} },
        filter: { and: { filters: [{ terms: { id: [query] } }] } }
      }
    },
    sort: {
      created_at: "asc"
    },
    raw: true,
    page: 1,
    per_page: 1
  };
}
function email(query) {
  return {
    query: {
      multi_match: {
        type: "phrase_prefix",
        query,
        operator: "and",
        fields: ["email.exact^2"]
      }
    },
    sort: {
      created_at: "asc"
    },
    raw: true,
    page: 1,
    per_page: 1
  };
}
function events(user_id) {
  return {
    filter: {
      has_parent: {
        type: "user_report",
        query: { match: { id: user_id } }
      }
    },
    sort: { created_at: "desc" },
    raw: true,
    page: 1,
    per_page: 15
  };
}
function eventId(i) {
  return {
    filter: {
      ids: {
        values: [i],
        type: "event"
      }
    },
    sort: {
      created_at: "desc"
    },
    raw: true,
    page: 1,
    per_page: 100
  };
}