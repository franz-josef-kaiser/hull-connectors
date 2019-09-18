const Hull = require("hull");
const { Cache } = require("hull/lib/infra");
const { devMode } = require("hull/lib/utils");
const express = require("express");
const redisStore = require("cache-manager-redis");

const server = require("./server");
const webpackConfig = require("../webpack.config");

if (process.env.LOG_LEVEL) {
  Hull.logger.transports.console.level = process.env.LOG_LEVEL;
}
Hull.logger.transports.console.json = true;

const {
  SECRET = "1234",
  NODE_ENV,
  CLIENT_ID,
  CLIENT_SECRET,
  OVERRIDE_FIREHOSE_URL,
  PORT = 8082
} = process.env;

let cache;

if (process.env.REDIS_URL) {
  cache = new Cache({
    store: redisStore,
    url: process.env.REDIS_URL,
    ttl: process.env.SHIP_CACHE_TTL || 60
  });
} else {
  cache = new Cache({
    store: "memory",
    max: process.env.SHIP_CACHE_MAX || 100,
    ttl: process.env.SHIP_CACHE_TTL || 60
  });
}

const options = {
  cache,
  hostSecret: SECRET,
  devMode: NODE_ENV === "development",
  port: PORT,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  Hull,
  clientConfig: {
    firehoseUrl: OVERRIDE_FIREHOSE_URL
  }
};

const app = express();
const connector = new Hull.Connector(options);
connector.use((req, res, next) => {
  req.hull = req.hull || {};
  req.hull.hostSecret = options.hostSecret;
  next();
});
if (options.devMode) {
  devMode(app, webpackConfig);
}
connector.setupApp(app);
server(app, options);
connector.startApp(app);
