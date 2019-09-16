import sample from "../../samples/user_event.json";
import triggerBuilder from "../lib/triggerBuilder";

const trigger = triggerBuilder({
  sample,
  noun: "user_event",
  action: "created"
});
export default trigger;
