/* @flow */

const _ = require("lodash");

process.env.CLIENT_ID = "1234";
process.env.CLIENT_SECRET = "1234";
const testScenario = require("hull-connector-framework/src/test-scenario");
import connectorConfig from "../../server/config";

it("Receive New Subscription", () => {
  return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
    return {
      handlerType: handlers.incomingRequestHandler,
      connector: {
        private_settings: {
          subscriptions: []
        }
      },
      usersSegments: [],
      accountsSegments: [],
      externalIncomingRequest: ({ superagent, connectorUrl, plainCredentials }) => {
        return superagent
          .post(`${connectorUrl}/subscribe?ship=${plainCredentials.ship}&organization=${plainCredentials.organization}&secret=1234`)
          .send(
            {
              "url": "https://hooks.zapier.com/hooks/standard/1/1/",
              "action": "entered_segment",
              "entityType": "user"
            }
          );
      },
      response: expect.whatever(),
      logs: [
        ["info", "incoming.job.start", {}, { "jobName": "Incoming Data", "type": "webpayload" }],
        ["info", "incoming.job.success", {}, { "jobName": "Incoming Data", "type": "webpayload" }]
      ],
      firehoseEvents:[],
      metrics: [["increment", "connector.request", 1,]],
      platformApiCalls: [
        ["GET", "/api/v1/app", {}, {}],
        ["GET", "/api/v1/users_segments?shipId=9993743b22d60dd829001999", { "shipId": "9993743b22d60dd829001999" }, {}],
        ["GET", "/api/v1/accounts_segments?shipId=9993743b22d60dd829001999", { "shipId": "9993743b22d60dd829001999" }, {}],
        ["GET", "/api/v1/app", {}, {}],
        ["PUT", "/api/v1/9993743b22d60dd829001999", {}, {
          "private_settings": {
            "subscriptions": [
              {
                "url": "https://hooks.zapier.com/hooks/standard/1/1/",
                "action": "entered_segment",
                "entityType": "user"
              }
            ]
          },
          "refresh_status": false
        }]
      ]
    };
  });
});


it("Receive New Subscription And Merge With Existing Subscriptions", () => {
  return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
    return {
      handlerType: handlers.incomingRequestHandler,
      connector: {
        private_settings: {
          subscriptions: [
            {
              "url": "https://hooks.zapier.com/hooks/standard/1/1/",
              "action": "entered_segment",
              "entityType": "user"
            }
          ]
        }
      },
      usersSegments: [],
      accountsSegments: [],
      externalIncomingRequest: ({ superagent, connectorUrl, plainCredentials }) => {
        return superagent
          .post(`${connectorUrl}/subscribe?ship=${plainCredentials.ship}&organization=${plainCredentials.organization}&secret=1234`)
          .send(
            {
              "url": "https://hooks.zapier.com/hooks/standard/1/2/",
              "action": "entered_segment",
              "entityType": "user"
            }
          );
      },
      response: expect.whatever(),
      logs: [
        ["info", "incoming.job.start", {}, { "jobName": "Incoming Data", "type": "webpayload" }],
        ["info", "incoming.job.success", {}, { "jobName": "Incoming Data", "type": "webpayload" }]
      ],
      firehoseEvents:[],
      metrics: [["increment", "connector.request", 1,]],
      platformApiCalls: [
        ["GET", "/api/v1/app", {}, {}],
        ["GET", "/api/v1/users_segments?shipId=9993743b22d60dd829001999", { "shipId": "9993743b22d60dd829001999" }, {}],
        ["GET", "/api/v1/accounts_segments?shipId=9993743b22d60dd829001999", { "shipId": "9993743b22d60dd829001999" }, {}],
        ["GET", "/api/v1/app", {}, {}],
        ["PUT", "/api/v1/9993743b22d60dd829001999", {}, {
          "private_settings": {
            "subscriptions": [
              {
                "url": "https://hooks.zapier.com/hooks/standard/1/1/",
                "action": "entered_segment",
                "entityType": "user"
              },
              {
                "url": "https://hooks.zapier.com/hooks/standard/1/2/",
                "action": "entered_segment",
                "entityType": "user"
              }
            ]
          },
          "refresh_status": false
        }]
      ]
    };
  });
});

it("Receive New Subscription And Unable To Merge With Existing Subscriptions", () => {
  return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
    return {
      handlerType: handlers.incomingRequestHandler,
      connector: {
        private_settings: {
          subscriptions: [
            {
              "url": "https://hooks.zapier.com/hooks/standard/1/1/",
              "action": "entered_segment",
              "entityType": "user"
            }
          ]
        }
      },
      usersSegments: [],
      accountsSegments: [],
      externalIncomingRequest: ({ superagent, connectorUrl, plainCredentials }) => {
        return superagent
          .post(`${connectorUrl}/subscribe?ship=${plainCredentials.ship}&organization=${plainCredentials.organization}&secret=1234`)
          .send(
            {
              "url": "https://hooks.zapier.com/hooks/standard/1/1/",
              "action": "entered_segment",
              "entityType": "user"
            }
          );
      },
      response: expect.whatever(),
      logs: [
        ["info", "incoming.job.start", {}, { "jobName": "Incoming Data", "type": "webpayload" }],
        ["info", "incoming.job.success", {}, { "jobName": "Incoming Data", "type": "webpayload" }]
      ],
      firehoseEvents:[],
      metrics: [["increment", "connector.request", 1,]],
      platformApiCalls: [["GET", "/api/v1/app", {}, {}],
        ["GET", "/api/v1/users_segments?shipId=9993743b22d60dd829001999", { "shipId": "9993743b22d60dd829001999" }, {}],
        ["GET", "/api/v1/accounts_segments?shipId=9993743b22d60dd829001999", { "shipId": "9993743b22d60dd829001999" }, {}]
      ]
    };
  });
});
