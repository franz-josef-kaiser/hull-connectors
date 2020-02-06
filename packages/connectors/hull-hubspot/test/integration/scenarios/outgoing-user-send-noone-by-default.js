// @flow







const testScenario = require("hull-connector-framework/src/test-scenario");
import connectorConfig from "../../../server/config";


process.env.OVERRIDE_HUBSPOT_URL = "";

const connector = {
  private_settings: {
    token: "hubToken",
    synchronized_user_segments: [],
    mark_deleted_contacts: false,
    mark_deleted_companies: false
  }
};

it("should send noone by default", () => {
  const email = "email@email.com";
  return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
    return {
      handlerType: handlers.notificationHandler,
      handlerUrl: "smart-notifier",
      channel: "user:update",
      externalApiMock: () => {
        const scope = nock("https://api.hubapi.com");
        scope.get("/contacts/v2/groups?includeProperties=true")
          .reply(200, []);
        scope.get("/properties/v1/companies/groups?includeProperties=true")
          .reply(200, []);
        return scope;
      },
      connector,
      usersSegments: ["hullSegmentId"],
      accountsSegments: [],
      messages: [
        {
          user: {
            email
          },
          segments: [{ id: "hullSegmentId", name: "hullSegmentName" }]
        }
      ],
      response: {
        flow_control: {
          in: 5,
          in_time: 10,
          size: 10,
          type: "next"
        }
      },
      logs: [
        ["debug", "connector.service_api.call", expect.whatever(), expect.whatever()],
        ["debug", "connector.service_api.call", expect.whatever(), expect.whatever()],
        ["debug", "outgoing.job.start", expect.whatever(), {"toInsert": 0, "toSkip": 1, "toUpdate": 0}],
        [
          "debug",
          "outgoing.user.skip",
          expect.objectContaining({ "subject_type": "user", "user_email": "email@email.com"}),
          {"reason": "User doesn't match outgoing filter"}
        ]
      ],
      firehoseEvents: [],
      metrics: [
        ["increment", "connector.request", 1],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.any(Number)],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.any(Number)]
      ],
      platformApiCalls: [
        ["GET", "/api/v1/search/user_reports/bootstrap", {}, {}],
        ["GET", "/api/v1/search/account_reports/bootstrap", {}, {}]
      ]
    };
  });
});
