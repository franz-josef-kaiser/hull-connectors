import sample from "../../samples/account.json";
import triggerBuilder from "../lib/triggerBuilder";

const trigger = triggerBuilder({ sample, noun: "account", action: "deleted" });
export default trigger;
