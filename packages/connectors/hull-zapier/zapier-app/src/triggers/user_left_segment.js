const sample = require("../../samples/user-left-segment");
const { triggerBuilder } = require("../lib");
const { getUserSegments } = require("../lib/input-fields");
const { performSegmentChangedTrigger } = require("../lib/perform-trigger");

const user_left_segment = triggerBuilder({
  getInputFields: getUserSegments,
  performTrigger: performSegmentChangedTrigger,
  sample,
  description: "Triggers when a user leaves a segment.",
  entityType: "user",
  action: "left_segment"
});

module.exports = {
  user_left_segment
};
