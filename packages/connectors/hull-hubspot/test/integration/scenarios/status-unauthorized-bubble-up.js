// @flow







const testScenario = require("hull-connector-framework/src/test-scenario");
const _ = require("lodash");

process.env.CLIENT_ID = "123";
process.env.CLIENT_SECRET = "abc";

import connectorConfig from "../../../server/config";


process.env.OVERRIDE_HUBSPOT_URL = "";

const connector = {
  private_settings: {
    token: "hubToken",
    token_fetched_at: 1419967066626,
    expires_in: 10,
    refresh_token: "123",
    mark_deleted_contacts: false,
    mark_deleted_companies: false
  }
};

it("Should detect when we try to refresh token and fail with unauthorized", () => {
  return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
    return {
      handlerType: handlers.scheduleHandler,
      handlerUrl: "status",
      externalApiMock: () => {
        const scope = nock("https://api.hubapi.com");
        scope.get("/contacts/v2/groups?includeProperties=true")
          .reply(401, []);
        scope.post("/oauth/v1/token", "refresh_token=123&client_id=123&client_secret=abc&redirect_uri=&grant_type=refresh_token")
          .reply(400, []);
        return scope;
      },
      connector,
      usersSegments: [],
      accountsSegments: [],
      response: {"messages": ['Authorization issue. Please reauthenticate with Hubspot by clicking the "Credentials and Actions" button in the upper right hand section of the connector settings.  Then either click "Continue to Hubspot" or "Start over"'], "status": "error"},
      logs: [
        ["debug", "connector.service_api.call", {}, {"method": "GET", "responseTime": expect.whatever(), "status": 401, "url": "/contacts/v2/groups", "vars": {}}],
        ["debug", "retrying query", {}, []], ["debug", "access_token", {}, {"expires_at": expect.whatever(), "expires_in": 10, "fetched_at": expect.whatever(), "utc_now": expect.whatever(), "will_expire_in": expect.whatever(), "will_expire_soon": true}],
        ["debug", "connector.service_api.call", {}, {"method": "POST", "responseTime": expect.whatever(), "status": 400, "url": "/oauth/v1/token", "vars": {}}]
      ],
      firehoseEvents: [],
      metrics: [
        ["increment", "connector.request", 1],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.whatever()],
        ["increment", "connector.service_api.error", 1],
        ["increment", "ship.service_api.call", 1],
         ["increment", "ship.service_api.call", 1],
         ["value", "connector.service_api.response_time", expect.whatever()],
         ["increment", "connector.service_api.error", 1]],
      platformApiCalls: [
        ["PUT", "/api/v1/9993743b22d60dd829001999/status", {},
          {
            "messages":
              [
                'Authorization issue. Please reauthenticate with Hubspot by clicking the "Credentials and Actions" button in the upper right hand section of the connector settings.  Then either click "Continue to Hubspot" or "Start over"'
              ],
            "status": "error"
          }
        ]
      ]
    };
  });
});
