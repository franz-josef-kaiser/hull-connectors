// @flow
import _ from "lodash";
import type { HullContext } from "hull";
import type { Event } from "../types";
import {
  getEventName,
  getAttributes,
  getEventData,
  getClaims,
  getEventContext
} from "./event-map";

export default async function ingest(ctx: HullContext, event: Event) {
  const { connector, client } = ctx;
  const { private_settings } = connector;
  const { preferred_phone, preferred_email = "" } = private_settings;
  const eventLabel = getEventName(event);
  if (eventLabel === undefined) {
    return;
  }
  const response = getClaims(preferred_email, preferred_phone)(event);
  if (!response) {
    return;
  }
  const { claims, aliases } = response;
  const attributes = getAttributes(event);
  if (claims) {
    const userScope = client.asUser(claims);
    if (aliases.length) {
      aliases.map(anonymous_id => userScope.link({ anonymous_id }));
    }
    await Promise.all([
      _.size(attributes) ? userScope.traits(attributes) : Promise.resolve(),
      userScope.track(eventLabel, getEventData(event), getEventContext(event))
    ]);
  }
}
