import sample from "../../samples/user.json";
import triggerBuilder from "../lib/triggerBuilder";

const trigger = triggerBuilder({
  sample,
  noun: "user",
  action: "entered_segment"
});
export default trigger;
