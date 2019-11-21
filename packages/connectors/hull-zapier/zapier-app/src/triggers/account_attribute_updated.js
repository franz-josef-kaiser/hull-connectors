const sample = require("../../samples/account-attribute-updated");
const { triggerBuilder } = require("../lib");
const { getAccountAttributes } = require("../lib/input-fields");
const { performAttributesUpdatedTrigger } = require("../lib/perform-trigger");

const account_attribute_updated = triggerBuilder({
  getInputFields: getAccountAttributes,
  performTrigger: performAttributesUpdatedTrigger,
  sample,
  description: "Triggers when an account attribute is updated.",
  entityType: "account",
  action: "attribute_updated"
});

module.exports = {
  account_attribute_updated
};
