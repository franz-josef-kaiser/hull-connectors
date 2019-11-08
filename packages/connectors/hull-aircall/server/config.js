// @flow

import type { HullConnectorConfig } from "hull";
import manifest from "../manifest.json";
import fetchToken from "./lib/fetch-token";
import handlers from "./handlers";

export default function connectorConfig(): HullConnectorConfig {
  const {
    LOG_LEVEL,
    SECRET,
    NODE_ENV,
    PORT = 8082,
    OVERRIDE_FIREHOSE_URL,
    CLIENT_ID,
    CLIENT_SECRET
  } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "Missing Client ID and/or Secret. Check your environment variables"
    );
  }
  const hostSecret = SECRET || "1234";

  return {
    manifest,
    hostSecret,
    devMode: NODE_ENV === "development",
    port: PORT || 8082,
    handlers: handlers({ clientID: CLIENT_ID, clientSecret: CLIENT_SECRET }),
    middlewares: [fetchToken],
    cacheConfig: {
      store: "memory",
      ttl: 1
    },
    httpClientConfig: {
      prefix: "https://api.aircall.io/v1"
    },
    logsConfig: {
      logLevel: LOG_LEVEL
    },
    clientConfig: {
      firehoseUrl: OVERRIDE_FIREHOSE_URL
    },
    serverConfig: {
      start: true
    }
  };
}
