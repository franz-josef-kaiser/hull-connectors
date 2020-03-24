// @flow

import type { HullConnectorConfig } from "hull";
import manifest from "../manifest.json";
import handlers from "./handlers";

export default function connectorConfig(): HullConnectorConfig {
  const {
    LOG_LEVEL,
    SECRET,
    NODE_ENV,
    PORT = 8082,
    OVERRIDE_FIREHOSE_URL,
    REDIS_URL,
    CLUSTER = false,
    SHIP_CACHE_TTL = 60,
    SHIP_CACHE_MAX = 100,
    FLOW_CONTROL_IN,
    FLOW_CONTROL_SIZE
  } = process.env;

  const cacheConfig =
    REDIS_URL !== undefined
      ? {
          store: "redis",
          url: REDIS_URL
        }
      : { store: "memory" };
  return {
    manifest,
    hostSecret: SECRET || "1234",
    devMode: NODE_ENV === "development",
    port: PORT || 8082,
    timeout: "25s",
    handlers: handlers({
      flow_size: FLOW_CONTROL_SIZE || 100,
      flow_in: FLOW_CONTROL_IN || 10
    }),
    middlewares: [],
    cacheConfig: {
      ...cacheConfig,
      ttl: SHIP_CACHE_TTL || 60,
      max: SHIP_CACHE_MAX || 100
    },
    logsConfig: {
      logLevel: LOG_LEVEL
    },
    clientConfig: {
      firehoseUrl: OVERRIDE_FIREHOSE_URL
    },
    serverConfig: {
      cluster: !!(CLUSTER && CLUSTER === "true"),
      start: true
    }
  };
}
