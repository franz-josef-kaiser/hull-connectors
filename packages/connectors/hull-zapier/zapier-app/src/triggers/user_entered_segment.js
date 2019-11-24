const sample = require("../../samples/user-entered-segment");
const { triggerBuilder } = require("../lib");
const { getUserSegments } = require("../lib/input-fields");
const { performSegmentChangedTrigger } = require("../lib/perform-trigger");

const user_entered_segment = triggerBuilder({
  getInputFields: getUserSegments,
  performTrigger: performSegmentChangedTrigger,
  sample,
  description: "Triggers when a user enters a segment.",
  entityType: "user",
  action: "entered_segment",
  important: true
});

module.exports = {
  user_entered_segment
};
