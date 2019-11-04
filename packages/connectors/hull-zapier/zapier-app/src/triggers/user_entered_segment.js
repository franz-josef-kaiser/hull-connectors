const sample = require("../../samples/user-entered-segment");
const { triggerBuilder } = require("../lib");
const { getUserSegments } = require("../lib/input-fields");
const { performSegmentChangedTrigger } = require("../lib/perform-trigger");

const user_entered_segment = triggerBuilder({
  getInputFields: getUserSegments,
  performTrigger: performSegmentChangedTrigger,
  sample,
  description: "User Entered Segment Trigger",
  entityType: "user",
  action: "entered_segment"
});

module.exports = {
  user_entered_segment
};
