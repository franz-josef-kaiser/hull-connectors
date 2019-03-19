// @flow
const _ = require("lodash");

process.env.CLIENT_ID = "1234";
process.env.CLIENT_SECRET = "1234";

declare function describe(name: string, callback: Function): void;
declare function before(callback: Function): void;
declare function beforeEach(callback: Function): void;
declare function afterEach(callback: Function): void;
declare function it(name: string, callback: Function): void;
declare function test(name: string, callback: Function): void;

const testScenario = require("hull-connector-framework/src/test-scenario");
import connectorConfig from "../../../server/config";


test("send batch user update to outreach", () => {
  return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
    const updateMessages = require("../fixtures/notifier-payloads/outgoing-account-batch.json");
    return _.assign(updateMessages, {
      handlerType: handlers.batchHandler,
      handlerUrl: "batch-accounts",
      channel: "account:update",
      messages: [require("../fixtures/notifier-payloads/outgoing-account-batch-payload.json")],
      connector: {
        private_settings: {
          access_token: "1234",
          outgoing_account_attributes: [
            {
                "hull": "name",
                "service": "name"
            },
            {
                "hull": "traits_closeio/description",
                "service": "custom1"
            },
            {
                "hull": "traits_closeio/industry_sample",
                "service": "custom2"
            },
            {
                "hull": "traits_closeio/status",
                "service": "custom3"
            },
          ],
          account_claims: [
              {
                  "hull": "domain",
                  "service": "domain"
              },
              {
                  "hull": "external_id",
                  "service": "customId"
              }
          ]
        }
      },
      externalApiMock: () => {
        const scope = nock("https://api.outreach.io");

        scope.get("/api/v2/webhooks/")
          .reply(200, {body: {data: []}});
        scope
          .post("/api/v2/webhooks/")
          .reply(201, require("../fixtures/api-responses/create-webhook.json"));

          scope
            .get("/api/v2/accounts/?filter[domain]=bluth.com")
            .reply(200, require("../fixtures/api-responses/outgoing-account-bluth-lookup.json"));

          // , {"data":{"type":"account","id":29,"attributes":{"domain":"bluth.com","custom1":"Real estate","name":"Bluth Company (Sample Lead)","locality":"RI"}}}
          scope
            .intercept('/api/v2/accounts/29', 'PATCH', {"data": {"attributes": {"custom1": "", "custom2": "Real estate", "custom3": "Qualified", "domain": "bluth.com", "name": "Bluth Company (Sample Lead)"}, "id": 29, "type": "account"}})
            .reply(200, require("../fixtures/api-responses/outgoing-account-bluth-patch.json"));


        return scope;
      },
      response: {},
      // most of the remaining "whatevers" are returned from the nock endpoints or are tested in traits
      logs: [
        ["info", "outgoing.job.start", {}, {"jobName": "Outgoing Data", "type": "account"}],
        ["debug", "connector.service_api.call", {}, {"method": "GET", "responseTime": expect.whatever(), "status": 200, "url": "/webhooks/", "vars": {}}],
        ["debug", "connector.service_api.call", {}, {"method": "POST", "responseTime": expect.whatever(), "status": 201, "url": "/webhooks/", "vars": {}}],
        ["debug", "connector.service_api.call", {}, {"method": "GET", "responseTime": expect.whatever(), "status": 200, "url": "/accounts/", "vars": {}}],
        ["debug", "connector.service_api.call", {}, {"method": "PATCH", "responseTime": expect.whatever(), "status": 200, "url": "/accounts/29", "vars": {}}],
        ["info", "outgoing.account.success", {"account_domain": "bluth.com", "account_id": expect.whatever(), "subject_type": "account"}, expect.whatever()],
        ["info", "incoming.account.success", {}, {"data": {"attributes": {"outreach/id": {"operation": "set", "value": 29}}, "ident": {"anonymous_id": "outreach:29", "domain": "bluth.com"}}}],
        ["info", "outgoing.job.success", {}, {"jobName": "Outgoing Data", "type": "account"}]
      ],
      firehoseEvents: [
        ["traits", {"asAccount": {"anonymous_id": "outreach:29", "domain": "bluth.com"}, "subjectType": "account"}, {"outreach/id": {"operation": "set", "value": 29}}]
      ],
      metrics: [
        ["increment", "connector.request", 1],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.whatever()],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.whatever()],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.whatever()],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.whatever()],
        ["increment", "ship.outgoing.accounts", 1],
        ["increment", "ship.incoming.accounts", 1]
      ],
      platformApiCalls: [
        ["GET", "/_accounts_batch", {}, {}],
        ["GET", "/api/v1/app", {}, {}],
        ["PUT", "/api/v1/9993743b22d60dd829001999", {}, {"private_settings": {"access_token": "1234", "account_claims": [{"hull": "domain", "service": "domain"}, {"hull": "external_id", "service": "customId"}], "outgoing_account_attributes": [{"hull": "name", "service": "name"}, {"hull": "traits_closeio/description", "service": "custom1"}, {"hull": "traits_closeio/industry_sample", "service": "custom2"}, {"hull": "traits_closeio/status", "service": "custom3"}], "webhook_id": 3}}]
      ]
    });
  });
});
