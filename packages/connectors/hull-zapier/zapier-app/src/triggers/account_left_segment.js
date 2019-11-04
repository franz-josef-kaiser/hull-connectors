const sample = require("../../samples/account-left-segment");
const { triggerBuilder } = require("../lib");
const { getAccountSegments } = require("../lib/input-fields");
const { performSegmentChangedTrigger } = require("../lib/perform-trigger");

const account_left_segment = triggerBuilder({
  getInputFields: getAccountSegments,
  performTrigger: performSegmentChangedTrigger,
  sample,
  description: "Account Left Segment Trigger",
  entityType: "account",
  action: "left_segment"
});

module.exports = {
  account_left_segment
};
