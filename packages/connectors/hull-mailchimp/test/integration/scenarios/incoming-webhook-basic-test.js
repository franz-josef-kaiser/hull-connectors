// @flow
import connectorConfig from "../../../server/config";

const path = require("path");
const testScenario = require("hull-connector-framework/src/test-scenario");

process.env.MAILCHIMP_CLIENT_ID = "1234";
process.env.MAILCHIMP_CLIENT_SECRET = "1234";
process.env.COMBINED = "true";

it("should handle incoming webhook GET call", () => {
  const email = "";
  return testScenario(
    {
      connectorConfig
    },
    ({ handlers, nock, expect }) => {
      return {
        handlerType: handlers.incomingRequestHandler,
        externalIncomingRequest: ({
          superagent,
          connectorUrl,
          plainCredentials
        }) => {
          return superagent
            .get(`${connectorUrl}/mailchimp`)
            .query(plainCredentials)
            .send({ ping: true });
        },
        externalApiMock: () => {},
        connector: {},
        usersSegments: [],
        accountsSegments: [],
        response: { ok: true, message: "Webhook registered" },
        logs: [],
        firehoseEvents: [],
        metrics: [["increment", "connector.request", 1]],
        platformApiCalls: [
          ["GET", "/api/v1/app", {}, {}],
          [
            "GET",
            expect.stringContaining("/api/v1/users_segments"),
            expect.whatever(),
            {}
          ],
          [
            "GET",
            expect.stringContaining("/api/v1/accounts_segments"),
            expect.whatever(),
            {}
          ]
        ]
      };
    }
  );
});
