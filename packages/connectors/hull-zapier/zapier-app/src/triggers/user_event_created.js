const sample = require("../../samples/user-event-created");
const { triggerBuilder } = require("../lib");
const { getUserEventSchema } = require("../lib/input-fields");
const { performEventCreatedTrigger } = require("../lib/perform-trigger");

const user_event_created = triggerBuilder({
  getInputFields: getUserEventSchema,
  performTrigger: performEventCreatedTrigger,
  sample,
  description: "User Event Occurred",
  entityType: "user_event",
  action: "created"
});

module.exports = {
  user_event_created
};
