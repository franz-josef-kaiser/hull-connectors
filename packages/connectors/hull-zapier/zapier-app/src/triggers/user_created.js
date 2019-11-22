const sample = require( "../../samples/user-created");
const { triggerBuilder } = require("../lib");
const { performEntityCreatedTrigger } = require("../lib/perform-trigger");
const { getUserSegments, getEmpty } = require("../lib/input-fields");

const user_created = triggerBuilder({
  getInputFields: getUserSegments,
  performTrigger: performEntityCreatedTrigger,
  sample,
  description: "Triggers when a user is created.",
  entityType: "user",
  action: "created"
});

module.exports = {
  user_created
};
