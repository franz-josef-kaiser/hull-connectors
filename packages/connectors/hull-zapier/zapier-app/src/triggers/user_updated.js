import sample from "../../samples/user.json";
import triggerBuilder from "../lib/trigger-builder";
import { userSegment } from "../lib/subscription-input-fields";

const trigger = triggerBuilder({
  inputFields: userSegment,
  sample,
  noun: "user",
  action: "updated"
});
export default trigger;
