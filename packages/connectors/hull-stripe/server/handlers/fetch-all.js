// @flow
import type { HullContext, HullExternalResponse } from "hull";

import fetchHistory from "../lib/fetch-history";

export default async function fetchAll(ctx: HullContext): HullExternalResponse {
  try {
    const response = await fetchHistory(ctx);
    return {
      status: 200,
      response
    };
  } catch (e) {
    return {
      status: 500,
      repsonse: e.message
    };
  }
}
