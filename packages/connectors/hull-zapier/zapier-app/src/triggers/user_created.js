const sample = require( "../../samples/user");
const { triggerBuilder } = require("../lib");
const { performEntityCreatedTrigger } = require("../lib/perform-trigger");
const { getUserSegments, getEmpty } = require("../lib/input-fields");

const user_created = triggerBuilder({
  getInputFields: getUserSegments,
  performTrigger: performEntityCreatedTrigger,
  sample,
  description: "User Created",
  entityType: "user",
  action: "created"
});

module.exports = {
  user_created
};
