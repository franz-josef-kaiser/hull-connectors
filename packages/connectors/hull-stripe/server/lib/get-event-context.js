const moment = require("moment");

function getEventContext(event) {
  return {
    source: "stripe",
    type: "payment",
    created_at: moment(event.created, "X").format(),
    event_id: event.id
  };
}

module.exports = getEventContext;
