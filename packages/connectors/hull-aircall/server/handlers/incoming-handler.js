// @flow

import type {
  HullContext,
  // HullResponse,
  HullIncomingHandlerMessage,
  HullExternalResponse
} from "hull";
import ingest from "../lib/ingest";
import type { Event } from "../types";
import getInsightsCard from "../lib/get-insights-card";
import authRequest from "../lib/authenticated-request";

const handler = async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): HullExternalResponse => {
  const { metric } = ctx;
  // $FlowFixMe
  const event: Event = message.body;
  const { data = {} } = event;
  const { id } = data;
  if (event.event === "call.created") {
    const contents = getInsightsCard(ctx, event);
    await authRequest(ctx)
      .post(`/calls/${id}/insight_cards`)
      .send({ contents });
  }
  metric.increment("ship.service_api.call");
  ingest(ctx, event);

  return {
    status: 200,
    data: {
      ok: true
    }
  };
};
export default handler;
