import sample from "../../samples/account.json";
import triggerBuilder from "../lib/trigger-builder";

const trigger = triggerBuilder({
  sample,
  noun: "account",
  action: "created"
});
export default trigger;
