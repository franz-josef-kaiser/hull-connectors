const sample = require( "../../samples/user.json");
const { triggerBuilder } = require("../lib");
const { performEntityDeletedTrigger } = require("../lib/perform-trigger");

const user_deleted = triggerBuilder({
  performTrigger: performEntityDeletedTrigger,
  sample,
  description: "User Attribute Updated",
  entityType: "user",
  action: "deleted"
});

module.exports = {
  user_deleted
};
