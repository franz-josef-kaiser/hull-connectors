const sample = require("../../samples/account-entered-segment");
const { triggerBuilder } = require("../lib");
const { getAccountSegments } = require("../lib/input-fields");
const { performSegmentChangedTrigger } = require("../lib/perform-trigger");

const account_entered_segment = triggerBuilder({
  getInputFields: getAccountSegments,
  performTrigger: performSegmentChangedTrigger,
  sample,
  description: "Triggers when an account enters a segment.",
  entityType: "account",
  action: "entered_segment"
});

module.exports = {
  account_entered_segment
};
