// @flow

import type { HullConnectorConfig } from "hull";
import manifest from "../manifest.json";
import handlers from "./handlers";

export default function connectorConfig(): HullConnectorConfig {
  const {
    LOG_LEVEL,
    SECRET,
    NODE_ENV,
    PORT,
    OVERRIDE_FIREHOSE_URL,
    REDIS_URL,
    CLUSTER = false,
    SHIP_CACHE_TTL,
    SHIP_CACHE_MAX,
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
  const cluster = !!(CLUSTER && (CLUSTER === "true" || CLUSTER === true));
  const workers = process.env.WEB_CONCURRENCY || 1;
  return {
    manifest,
    hostSecret: SECRET || "1234",
    devMode: NODE_ENV === "development",
    port: PORT || 8082,
    timeout: "25s",
    handlers: handlers({
      flow_size: FLOW_CONTROL_SIZE || 200,
      flow_in: FLOW_CONTROL_IN || 1
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
      cluster,
      workers,
      start: true
    }
  };
}
