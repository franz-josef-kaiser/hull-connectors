/* @flow */
import type {
  HullContext,
  HullOauthAuthorizeMessage,
  HullOAuthAuthorizeResponse
} from "hull";
import authRequest from "../lib/authenticated-request";

const moment = require("moment");
// const debug = require("debug")("hull-hubspot:oauth");

const onAuthorize = async (
  ctx: HullContext,
  message: HullOauthAuthorizeMessage
): HullOAuthAuthorizeResponse => {
  const { hostname, connector, clientCredentialsEncryptedToken } = ctx;
  const { id } = connector;
  const { account = {} } = message;
  const { accessToken } = account;
  if (!accessToken) {
    throw new Error("Can't find access token");
  }
  // Get all existing webhooks
  const webhooks = await authRequest(ctx, accessToken).get("/webhooks");
  // Delete all existing webhooks
  await Promise.all(
    webhooks.map(w => authRequest(ctx, accessToken).delete(`/webhooks/${w.id}`))
  );
  // Recreate our webhook
  await authRequest(ctx, accessToken)
    .post("/webhooks")
    .send({
      custom_name: "Webhook",
      url: `${hostname}/webhooks/${id}/${clientCredentialsEncryptedToken}`,
      active: true,
      events: [
        "call.created",
        "call.answered",
        "call.ended",
        "call.tagged",
        "call.commented",
        "call.transferred",
        "call.voicemail_left"
      ]
    });
  return {
    private_settings: {
      access_token: accessToken,
      token_fetched_at: moment()
        .utc()
        .format("x")
    }
  };
};
export default onAuthorize;
