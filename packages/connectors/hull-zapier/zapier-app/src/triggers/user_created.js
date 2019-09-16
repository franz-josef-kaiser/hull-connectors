import sample from "../../samples/user.json";
import triggerBuilder from "../lib/trigger-builder";

const trigger = triggerBuilder({
  sample,
  noun: "user",
  action: "created"
});
export default trigger;
