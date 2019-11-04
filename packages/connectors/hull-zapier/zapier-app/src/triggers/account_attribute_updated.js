const sample = require("../../samples/account");
const { triggerBuilder } = require("../lib");
const { getAccountAttributes } = require("../lib/input-fields");
const { performAttributesUpdatedTrigger } = require("../lib/perform-trigger");

const account_attribute_updated = triggerBuilder({
  getInputFields: getAccountAttributes,
  performTrigger: performAttributesUpdatedTrigger,
  sample,
  description: "Account Attribute Updated",
  entityType: "account",
  action: "attribute_updated"
});

module.exports = {
  account_attribute_updated
};
