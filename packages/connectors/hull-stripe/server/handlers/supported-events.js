// @flow
import type { HullContext, HullUISelectResponse } from "hull";
import _ from "lodash";
import EVENTS from "../mappers/events";

export default async function supportedEvents(
  _ctx: HullContext
): HullUISelectResponse {
  return {
    status: 200,
    data: _.map(EVENTS, e => ({
      label: e,
      value: e
    }))
  };
}
