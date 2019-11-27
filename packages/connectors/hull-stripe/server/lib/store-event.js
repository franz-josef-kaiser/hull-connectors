// @flow
import type { HullContext, HullUserClaims } from "hull";

const getEventContext = require("./get-event-context");
const getEventProperties = require("./get-event-properties");

function storeEvent(
  ctx: HullContext,
  { user, event, name }: { user: HullUserClaims, event: {}, name: string }
) {
  const { client } = ctx;
  const properties = getEventProperties(event);
  const context = getEventContext(event);
  const userClient = client.asUser(user);

  // Only track if we support this event type
  if (name) {
    return userClient.track(name, properties, context);
  }
  return "";
}

module.exports = storeEvent;
