// @flow
import type { HullContext, HullUserClaims } from "hull";

import getEventContext from "./get-event-context";
import getEventProperties from "./get-event-properties";

function storeEvent(
  ctx: HullContext,
  { user, event, name }: { user: HullUserClaims, event: {}, name: string }
) {
  const { client } = ctx;
  const properties = getEventProperties(event);
  const context = getEventContext(event);
  // Only track if we support this event type
  if (name) {
    return client.asUser(user).track(name, properties, context);
  }
  return undefined;
}

module.exports = storeEvent;
