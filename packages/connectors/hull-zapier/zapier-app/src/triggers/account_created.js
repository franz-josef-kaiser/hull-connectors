const sample = require( "../../samples/user");
const { triggerBuilder } = require("../lib");
const { performEntityCreatedTrigger } = require("../lib/perform-trigger");
const { getAccountSegments, getEmpty } = require("../lib/input-fields");

const account_created = triggerBuilder({
  getInputFields: getAccountSegments,
  performTrigger: performEntityCreatedTrigger,
  sample,
  description: "Account Created",
  entityType: "account",
  action: "created"
});

module.exports = {
  account_created
};
