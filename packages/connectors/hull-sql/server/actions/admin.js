/* @flow */
import type { HullContext, HullExternalResponse } from "hull";
import SyncAgent from "../lib/sync-agent";

async function admin(ctx: HullContext): HullExternalResponse {
  const { preview_timeout } = ctx.connectorConfig;
  const { private_settings } = ctx.connector;
  const agent = new SyncAgent(ctx);
  if (agent.areConnectionParametersConfigured()) {
    const query = agent.getQuery();

    return {
      pageLocation: "connected.html",
      data: {
        query,
        preview_timeout,
        last_sync_at: null,
        import_type: "users",
        ...private_settings
      }
    };
  }
  return {
    pageLocation: "home.html"
  };
}

module.exports = admin;
