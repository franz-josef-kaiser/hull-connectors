// @flow
import type { HullContext } from "hull";

export default function(ctx: HullContext, token?: string) {
  const { request, connector } = ctx;
  const { private_settings = {} } = connector;
  const { access_token } = private_settings;
  if (!token && !access_token) {
    throw new Error("Can't find an Access Token - please authenticate first");
  }
  return request.set("Authorization", `Bearer ${token || access_token}`);
}
