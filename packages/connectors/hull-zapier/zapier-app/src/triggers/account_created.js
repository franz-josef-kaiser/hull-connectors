const sample = require( "../../samples/account-created");
const { triggerBuilder } = require("../lib");
const { performEntityCreatedTrigger } = require("../lib/perform-trigger");
const { getAccountSegments, getEmpty } = require("../lib/input-fields");

const account_created = triggerBuilder({
  getInputFields: getAccountSegments,
  performTrigger: performEntityCreatedTrigger,
  sample,
  description: "Triggers when an account is created.",
  entityType: "account",
  action: "created"
});

module.exports = {
  account_created
};
