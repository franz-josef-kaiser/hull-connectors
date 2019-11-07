// @flow
import type { HullContext } from "hull";

export default function(ctx: HullContext, token?: string) {
  const { request, connector } = ctx;
  const { private_settings = {} } = connector;
  const { auth_token } = private_settings;
  if (!token && auth_token) {
    throw new Error("Can't find an auth token - please authenticate first");
  }
  return request.set("Authorization", `Bearer ${token || auth_token}`);
}
