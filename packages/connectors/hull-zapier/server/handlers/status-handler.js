/* @flow */
import type { HullContext, HullStatusResponse } from "hull";

async function statusCheckAction(_ctx: HullContext): HullStatusResponse {
  // const { connector } = ctx;
  // const { private_settings = {} } = connector;
  // const { synchronized_segments, site_id, api_key } = private_settings;
  return {
    status: "ok",
    messages: []
  };
}

module.exports = statusCheckAction;
