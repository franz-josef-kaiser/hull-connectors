const sample = require("../../samples/user-attribute-updated");
const { triggerBuilder } = require("../lib");
const { getUserAttributes } = require("../lib/input-fields");
const { performAttributesUpdatedTrigger } = require("../lib/perform-trigger");

const user_attribute_updated = triggerBuilder({
  getInputFields: getUserAttributes,
  performTrigger: performAttributesUpdatedTrigger,
  sample,
  description: "User Attribute Updated",
  entityType: "user",
  action: "attribute_updated"
});

module.exports = {
  user_attribute_updated
};
