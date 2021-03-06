// @flow

import type { HullConnectorConfig } from "hull";
import { entryModel } from "hull-vm";
import manifest from "../manifest.json";
import handlers from "./handlers";

export default function connectorConfig(): HullConnectorConfig {
  const {
    LOG_LEVEL,
    SECRET,
    NODE_ENV,
    PORT = 8082,
    OVERRIDE_FIREHOSE_URL,

    MONGO_URL,
    MONGO_COLLECTION_NAME = "scheduled_calls_requests"
  } = process.env;

  if (!MONGO_COLLECTION_NAME || !MONGO_URL) {
    throw new Error("One or more MongoDB Environment variables not set.");
  }
  const hostSecret = SECRET || "1234";
  // Mongo connection setup
  const EntryModel = entryModel({
    mongoUrl: MONGO_URL,
    collectionName: MONGO_COLLECTION_NAME
  });

  return {
    manifest,
    hostSecret,
    devMode: NODE_ENV === "development",
    port: PORT || 8082,
    handlers: handlers({ EntryModel }),
    middlewares: [],
    cacheConfig: {
      store: "memory",
      ttl: 1
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
