// @flow
import type { HullContext, HullStatusResponse } from "hull";
import authRequest from "../lib/authenticated-request";

export default async function statusCheck(
  ctx: HullContext
): HullStatusResponse {
  const { connector } = ctx;
  const { private_settings = {} } = connector;
  const { access_token } = private_settings;
  if (!access_token) {
    return {
      messages: [
        "No Access token was found. Please authenticate Aircall from the Settings tab"
      ],
      status: "warning"
    };
  }
  const response = await authRequest(ctx).get("/ping");
  if (!response || !response.ping) {
    return {
      messages: [
        "Something went wrong when pinging the Aircall API",
        response.toJson()
      ],
      status: "error"
    };
  }
  return { messages: [], status: "ok" };
}
