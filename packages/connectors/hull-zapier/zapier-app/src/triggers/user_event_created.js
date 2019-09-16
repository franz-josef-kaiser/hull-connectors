import sample from "../../samples/user_event.json";
import triggerBuilder from "../lib/trigger-builder";
import { userEventSchema } from "../lib/subscription-input-fields";

const trigger = triggerBuilder({
  inputFields: userEventSchema,
  sample,
  noun: "user_event",
  action: "created"
});
export default trigger;
