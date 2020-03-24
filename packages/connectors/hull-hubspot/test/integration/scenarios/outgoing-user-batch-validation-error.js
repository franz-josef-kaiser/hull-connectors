// @flow

const testScenario = require("hull-connector-framework/src/test-scenario");
import connectorConfig from "../../../server/config";


process.env.CLIENT_ID = "123";

const connector = {
  private_settings: {
    token: "hubToken",
    synchronized_user_segments: ["hullSegmentId"],
    mark_deleted_contacts: false,
    mark_deleted_companies: false
  }
};
const usersSegments = [
  {
    name: "testSegment",
    id: "hullSegmentId"
  }
];

it("should send out a new hull user to hubspot via batch", () => {
  const email = "email@email.com";
  return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
    return {
      handlerType: handlers.notificationHandler,
      handlerUrl: "smart-notifier",
      channel: "user:update",
      is_export: true,
      externalApiMock: () => {
        const scope = nock("https://api.hubapi.com");
        scope.get("/contacts/v2/groups?includeProperties=true")
          .reply(200, []);
        scope.get("/properties/v1/companies/groups?includeProperties=true")
          .reply(200, []);
        scope.post("/contacts/v1/contact/batch/?auditId=Hull", [{
          "properties": [{
            "property": "hull_segments",
            "value": "testSegment"
          }],
          "email": "non-existing-property@hull.io"
          }, {
          "properties": [{
            "property": "hull_segments",
            "value": "testSegment"
          }],
          "email": "email@email.com"
        }]).reply(400, require("../fixtures/post-contact-batch-nonexisting-property"));

        scope.post("/contacts/v1/contact/batch/?auditId=Hull", [{
          "properties": [{
            "property": "hull_segments",
            "value": "testSegment"
          }],
          "email": "email@email.com"
        }]).reply(202);
        return scope;
      },
      connector,
      usersSegments,
      accountsSegments: [],
      messages: [
        {
          "user": {
            email: "non-existing-property@hull.io"
          },
          "segments": [
            {
              "id": "hullSegmentId",
              "name": "",
              "updated_at": "2018-12-06T15:30:50Z",
              "type": "users_segment",
              "created_at": "2018-11-29T10:46:39Z"
            }
          ]
        },
        {
          "user": {
            email: email
          },
          "segments": [
            {
              "id": "hullSegmentId",
              "name": "",
              "updated_at": "2018-12-06T15:30:50Z",
              "type": "users_segment",
              "created_at": "2018-11-29T10:46:39Z"
            }
          ]
        }
      ],
      response: {"flow_control": {"in": 5, "in_time": 10, "size": 10, "type": "next"}},
      logs: [
        ["debug", "connector.service_api.call", expect.whatever(), expect.whatever()],
        ["debug", "connector.service_api.call", expect.whatever(), expect.whatever()],
        ["debug", "outgoing.job.start", expect.whatever(), {"toInsert": 2, "toSkip": 0, "toUpdate": 0}],
        ["debug", "connector.service_api.call", expect.whatever(), expect.objectContaining({ "method": "POST", "status": 400, "url": "/contacts/v1/contact/batch/" })],
        ["debug", "connector.service_api.call", expect.whatever(), expect.objectContaining({ "method": "POST", "status": 202, "url": "/contacts/v1/contact/batch/" })],
        [
          "error",
          "outgoing.user.error",
          expect.objectContaining({
            "subject_type": "user",
            "user_email": "non-existing-property@hull.io",
          }),
          {
            error: "Property \"non-existing-property\" does not exist",
            hubspotWriteContact: {
              "properties": [{
                "property": "hull_segments",
                "value": "testSegment"
              }],
              "email": "non-existing-property@hull.io"
            }
          }
        ],
        [
          "info",
          "outgoing.user.success",
          expect.objectContaining({ "subject_type": "user", "user_email": "email@email.com"}),
          { hubspotWriteContact: {"email": "email@email.com", "properties": [{"property": "hull_segments", "value": "testSegment"}]}}
        ]
      ],
      firehoseEvents: [],
      metrics: [
        ["increment", "connector.request", 1],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.any(Number)],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.any(Number)],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.any(Number)],
        ["increment", "connector.service_api.error", 1],
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
