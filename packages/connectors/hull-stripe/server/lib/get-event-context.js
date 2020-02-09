const moment = require("moment");

const getEventContext = event => ({
  source: "stripe",
  type: "payment",
  created_at: moment(event.created, "X").format(),
  event_id: event.id
});

export default getEventContext;
