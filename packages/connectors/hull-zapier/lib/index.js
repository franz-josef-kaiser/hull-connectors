"use strict";

const express = require("express");
const compression = require("compression");
const Hull = require("hull");
const { Cache } = require("hull/lib/infra");
const bodyParser = require("body-parser");
const server = require("./server");
const crypto = require("./lib/crypto");

if (process.env.LOG_LEVEL) {
  Hull.logger.transports.console.level = process.env.LOG_LEVEL;
}

Hull.logger.transports.console.json = true;

if (process.env.LOGSTASH_HOST && process.env.LOGSTASH_HOST) {
  const { Logstash } = require("winston-logstash"); // eslint-disable-line global-require
  Hull.logger.add(Logstash, {
    node_name: "processor",
    port: process.env.LOGSTASH_PORT,
    host: process.env.LOGSTASH_HOST
  });
}

const options = {
  hostSecret: process.env.SECRET || "1234",
  devMode: process.env.NODE_ENV === "development",
  debug: process.env.DEBUG,
  port: process.env.PORT || 8082,
  Hull,
  clientConfig: {
    firehoseUrl: process.env.OVERRIDE_FIREHOSE_URL
  }
};

let app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(crypto.middleware(options.hostSecret));
const connector = new Hull.Connector(options);
app.use(Hull.Middleware({ hostSecret: options.hostSecret, fetchShip: true }));
connector.setupApp(app);
app = server(connector, options, app);
connector.startApp(app);