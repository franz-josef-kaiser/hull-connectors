import sample from "../../samples/account.json";
import triggerBuilder from "../lib/trigger-builder";
import { accountSegment } from "../lib/subscription-input-fields";

const trigger = triggerBuilder({
  inputFields: accountSegment,
  sample,
  noun: "account",
  action: "updated"
});
export default trigger;
