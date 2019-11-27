// @flow

import moment from "moment";
import Stripe from "stripe";
import type {
  HullContext,
  HullOauthAuthorizeMessage,
  HullOAuthAuthorizeResponse
} from "hull";
import EVENTS from "../mappers/events";

const onAuthorize = async (
  ctx: HullContext,
  message: HullOauthAuthorizeMessage
): HullOAuthAuthorizeResponse => {
  const {
    client,
    connector,
    helpers,
    connectorConfig,
    hostname,
    clientCredentialsEncryptedToken
  } = ctx;
  const { hostSecret } = connectorConfig;
  const { encrypt } = helpers;

  if (!client || !connector) {
    throw new Error("Error, no Ship or Client");
  }

  const { account = {} } = message;
  const { profile = {}, refreshToken, accessToken } = account;
  const { stripe_user_id, stripe_publishable_key } = profile;
  const connectorData = {
    private_settings: {
      ...connector.private_settings,
      refresh_token: refreshToken,
      token: accessToken,
      stripe_user_id: encrypt(stripe_user_id, hostSecret),
      stripe_publishable_key,
      token_fetched_at: moment()
        .utc()
        .format("x")
    }
  };
  const stripe = Stripe(accessToken);

  // List all existing Endpoints
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });

  // Delete them
  await Promise.all(endpoints.map(e => stripe.webhookEndpoints.del(e.id)));

  // Create new ones
  await stripe.webhookEndpoints.create({
    url: `https://${hostname}/incoming?token=${clientCredentialsEncryptedToken}`,
    enabled_events: EVENTS
  });

  return connectorData;
};

export default onAuthorize;
