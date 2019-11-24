// @flow
const _ = require("lodash");

process.env.CLIENT_ID = "1234";
process.env.CLIENT_SECRET = "1234";

const testScenario = require("hull-connector-framework/src/test-scenario");
import connectorConfig from "../../../server/config";


test("send smart-notifier user update to outreach with returning account link", () => {
  return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
    const updateMessages = _.cloneDeep(require("../fixtures/notifier-payloads/outgoing-user-link-new-account.json"));
    updateMessages.connector.private_settings.link_users_in_hull = true;
    return _.assign(updateMessages, {
      handlerType: handlers.notificationHandler,
      handlerUrl: "smart-notifier",
      channel: "user:update",
      externalApiMock: () => {
        const scope = nock("https://api.outreach.io");
        scope
          .get("/api/v2/accounts/?filter[domain]=afterlife.com")
          .reply(200, { "data":[] });
        scope
          .post("/api/v2/accounts/", {"data":{"type":"account","attributes":{"domain":"afterlife.com","custom20":"very hot","name":"afterlife.com"}}})
          .reply(201, require("../fixtures/api-responses/outgoing-user-link-insert-account.json"));
        scope
          .intercept('/api/v2/prospects/18', 'PATCH', {"data":{"type":"prospect","id":18,"attributes":{"custom20":"in the afterlife"},"relationships":{"account":{"data":{"type":"account","id":184796}}}}})
          .reply(200, require("../fixtures/api-responses/outgoing-user-link-patch-user.json"));
        return scope;
      },
      response: {
        flow_control: {
          type: "next",
          in: 5,
          in_time: 10,
          size: 10,
        }
      },
      logs: [
        ["info", "outgoing.job.start", expect.whatever(), {"jobName": "Outgoing Data", "type": "user"}],
        ["debug", "connector.service_api.call", expect.whatever(), {"method": "GET", "responseTime": expect.whatever(), "status": 200, "url": "/accounts/", "vars": {}}],
        ["debug", "connector.service_api.call", expect.whatever(), {"method": "POST", "responseTime": expect.whatever(), "status": 201, "url": "/accounts/", "vars": {}}],
        ["info", "outgoing.account.success", expect.objectContaining({"account_domain": "afterlife.com", "subject_type": "account"}), {
          "data": {
            "data": {
              "type": "account",
              "attributes": {
                "domain": "afterlife.com",
                "custom20": "very hot",
                "name": "afterlife.com"
              }
            }
          },
          "type": "Account",
        } ],
        ["debug", "incoming.account.success", expect.whatever(), {"data": expect.whatever(), "type": "Account" }],
        ["debug", "connector.service_api.call", expect.whatever(), {"method": "PATCH", "responseTime": expect.whatever(), "status": 200, "url": "/prospects/18", "vars": {}}],
        ["info", "outgoing.user.success", expect.whatever(), {
          "data": {
            "data": {
              "type": "prospect",
              "id": 18,
              "relationships": {
                "account": {
                  "data": {
                    "type": "account",
                    "id": 184796
                  }
                }
              },
              "attributes": {
                "custom20": "in the afterlife"
              }
            }
          },
          "type": "Prospect"
        }],
        ["debug", "incoming.user.success", expect.whatever(), { "data": expect.whatever(), "type": "Prospect" }],
        ["info", "outgoing.job.success", expect.whatever(), {"jobName": "Outgoing Data", "type": "user"}]
      ],
      firehoseEvents: [
        ["traits", {"asAccount": {"anonymous_id": "outreach:184796", "domain": "afterlife.com"}, "subjectType": "account"}, {"outreach/id": {"operation": "set", "value": 184796}, "name": { "operation": "setIfNull", "value": "AfterLife" }, "outreach/company_type": {"operation": "set", "value": null}, "outreach/description": {"operation": "set", "value": null}}],
        ["traits", {"asUser": {"anonymous_id": "outreach:18", "email": "fettisbest@gmail.com"}, "subjectType": "user"}, {"outreach/custom2": { "operation": "set", "value": null }, "outreach/custom1": {"operation": "set", "value": "probably is a smuggler too"}, "outreach/id": {"operation": "set", "value": 18}, "outreach/personalnote2": {"operation": "set", "value": "froze han solo in carbinite, he was just a kid!  He's very efficient"}}],
        ["traits", {"asAccount": {"anonymous_id": "outreach:184796"}, "asUser": {"anonymous_id": "outreach:18", "email": "fettisbest@gmail.com"}, "subjectType": "account"}, {}]
      ],
      metrics: [
        ["increment", "connector.request", 1],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.whatever()],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.whatever()],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.whatever()]
      ]
    });
  });
});
