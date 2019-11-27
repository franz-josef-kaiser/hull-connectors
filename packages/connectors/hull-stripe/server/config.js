// @flow

import type { HullConnectorConfig } from "hull";
import Hull from "hull";
import _ from "lodash";
import manifest from "../manifest.json";
import handlers from "./handlers";
import stripeMiddleware from "./lib/stripe-middleware";

export default function connectorConfig(): HullConnectorConfig {
  const {
    PORT = "8082",
    LOG_LEVEL,
    NODE_ENV,
    SECRET = "1234",
    SIGNING_SECRET = "1234",
    OVERRIDE_FIREHOSE_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    SHIP_CACHE_TTL = 180,
    CACHE_REDIS_URL,
    CACHE_REDIS_MAX_CONNECTIONS = 5,
    CACHE_REDIS_MIN_CONNECTIONS = 1
  } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET || !SIGNING_SECRET) {
    throw new Error(
      "Can't find Slack Client ID and/or Client Secret and/or SIGNING_SECRET, check env vars"
    );
  }

  // We're not using default assignments because "null" values makes Flow choke
  const hostSecret = SECRET || "1234";
  const port = PORT || "8082";
  const devMode = NODE_ENV === "development";
  const scopes = _.get(
    _.find(manifest.private_settings, s => s.format === "oauth"),
    "options.strategy.scope"
  );
  return {
    manifest,
    devMode,
    logLevel: LOG_LEVEL,
    hostSecret,
    port,
    middlewares: [stripeMiddleware({ Hull })],
    cache: CACHE_REDIS_URL && {
      store: "redis",
      url: CACHE_REDIS_URL,
      ttl: SHIP_CACHE_TTL,
      max: CACHE_REDIS_MAX_CONNECTIONS,
      min: CACHE_REDIS_MIN_CONNECTIONS
    },
    handlers: handlers({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      signingSecret: SIGNING_SECRET,
      scopes,
      devMode
    }),
    clientConfig: {
      firehoseUrl: OVERRIDE_FIREHOSE_URL
    }
  };
}
