/* @flow */
const _ = require("lodash");

process.env.CLIENT_ID = "1234";
process.env.CLIENT_SECRET = "1234";
const testScenario = require("hull-connector-framework/src/test-scenario");
import connectorConfig from "../../server/config";

describe("Outgoing Users Tests", () => {
  it("Send Single User To Zapier", () => {
    return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
      const updateMessages = _.cloneDeep(require("./fixtures/notifier-payloads/update-single-user"));
      const private_settings = {
        ...updateMessages.connector.private_settings
      };
      const message1 =
        {
          "changes": {
            "is_new": false,
            "account": {},
            "user": {
              "attr": ["1", "2"]
            },
            "account_segments": {},
            "segments": {}
          },
          "account": {},
          "user": {
            "id": "5bd329d5e2bcf3eeaf000099",
            "name": "Bob Bobby",
            "email": "bob@bobby.com",
          },
          "account_segments": [],
          "segments": [
            {
              "id": "user_segment_1",
              "name": "UserSegment1",
              "type": "users_segment",
            }
          ],
          "message_id": "message_1"
        };

      _.set(updateMessages, "messages", [
        message1
      ]);
      _.set(updateMessages.connector, "private_settings", private_settings);
      return _.assign(updateMessages, {
        handlerType: handlers.notificationHandler,
        handlerUrl: "smart-notifier",
        channel: "user:update",
        externalApiMock: () => {
          const scope = nock("https://hooks.zapier.com/hooks/standard/5687326");

          scope
            .post("/user-attribute-updated/1")
            .reply(200, {
              "status": "success",
              "attempt": "1",
              "id": "1",
              "request_id": "1"
            });

          return scope;
        },
        response: { flow_control: { type: "next", in: 5, in_time: 10, size: 10, } },
        logs: [
          ["info", "outgoing.job.start", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }],
          ["debug", "connector.service_api.call", { "request_id": expect.whatever() },
            expect.objectContaining({"url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/1", "method": "POST"})
          ],
          ["info", "outgoing.user.success",
            expect.objectContaining({ "subject_type": "user", "user_email": "bob@bobby.com" }),
            expect.objectContaining({ "data": expect.objectContaining({"message_id": "message_1"}), "type": "User", "operation": "post" })
          ],
          ["info", "outgoing.job.success", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }]
        ],
        firehoseEvents:[],
        metrics: [["increment", "connector.request", 1,], ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()]],
        platformApiCalls: []
      });
    });
  });

  it("Send New User To Zapier", () => {
    return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
      const updateMessages = _.cloneDeep(require("./fixtures/notifier-payloads/update-single-user"));
      const private_settings = {
        ...updateMessages.connector.private_settings,
        "subscriptions": [
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-created/1",
            "action": "created",
            "entityType": "user"
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/account-attribute-updated",
            "action": "attribute_updated",
            "entityType": "account"
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1",
            "action": "entered_segment",
            "entityType": "user"
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1",
            "action": "left_segment",
            "entityType": "user"
          }
        ]
      };
      const message1 =
        {
          "changes": {
            "is_new": true,
          },
          "account": {},
          "user": {
            "id": "5bd329d5e2bcf3eeaf000099",
            "email": "bob@bobby.com",
          },
          "account_segments": [],
          "segments": [
            {
              "id": "user_segment_1",
              "name": "UserSegment1",
              "type": "users_segment",
            }
          ],
          "message_id": "message_1"
        };

      _.set(updateMessages, "messages", [
        message1
      ]);
      _.set(updateMessages.connector, "private_settings", private_settings);
      return _.assign(updateMessages, {
        handlerType: handlers.notificationHandler,
        handlerUrl: "smart-notifier",
        channel: "user:update",
        externalApiMock: () => {
          const scope = nock("https://hooks.zapier.com/hooks/standard/5687326");

          scope
            .post("/user-created/1")
            .reply(200, {
              "status": "success",
              "attempt": "1",
              "id": "1",
              "request_id": "1"
            });

          return scope;
        },
        response: { flow_control: { type: "next", in: 5, in_time: 10, size: 10, } },
        logs: [
          ["info", "outgoing.job.start", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }],
          ["debug", "connector.service_api.call", { "request_id": expect.whatever() },
            expect.objectContaining({"url": "https://hooks.zapier.com/hooks/standard/5687326/user-created/1", "method": "POST"})
          ],
          ["info", "outgoing.user.success",
            expect.objectContaining({ "subject_type": "user", "user_email": "bob@bobby.com" }),
            expect.objectContaining({ "data": expect.objectContaining({"message_id": "message_1"}), "type": "User", "operation": "post" })
          ],
          ["info", "outgoing.job.success", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }]
        ],
        firehoseEvents:[],
        metrics: [["increment", "connector.request", 1,], ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()]],
        platformApiCalls: []
      });
    });
  });

  it("Send Single User To Multiple Zaps", () => {
    return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
      const updateMessages = _.cloneDeep(require("./fixtures/notifier-payloads/update-single-user"));
      const private_settings = {
        ...updateMessages.connector.private_settings,
        "subscriptions": [
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/1",
            "action": "attribute_updated",
            "entityType": "user"
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/account-attribute-updated",
            "action": "attribute_updated",
            "entityType": "account"
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1",
            "action": "entered_segment",
            "entityType": "user"
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1",
            "action": "left_segment",
            "entityType": "user"
          }
        ]
      };
      const message1 =
        {
          "changes": {
            "is_new": false,
            "account": {},
            "user": {
              "attr": ["1", "2"]
            },
            "account_segments": {},
            "segments": {
              "left": [
                {
                  "id": "user_segment_3",
                  "name": "UserSegment3"
                }
              ],
              "entered": [
                {
                  "id": "user_segment_1",
                  "name": "UserSegment1"
                }
              ]
            }
          },
          "account": {},
          "user": {
            "id": "5bd329d5e2bcf3eeaf000099",
            "name": "Bob Bobby",
            "email": "bob@bobby.com",
          },
          "account_segments": [],
          "segments": [
            {
              "id": "user_segment_1",
              "name": "UserSegment1",
              "type": "users_segment",
            }
          ],
          "message_id": "message_1"
        };

      _.set(updateMessages, "messages", [
        message1
      ]);
      _.set(updateMessages.connector, "private_settings", private_settings);
      return _.assign(updateMessages, {
        handlerType: handlers.notificationHandler,
        handlerUrl: "smart-notifier",
        channel: "user:update",
        externalApiMock: () => {
          const scope = nock("https://hooks.zapier.com/hooks/standard/5687326");

          scope
            .post("/user-attribute-updated/1")
            .reply(200, {
              "status": "success",
              "attempt": "1",
              "id": "1",
              "request_id": "1"
            });

          scope
            .post("/user-entered-segment/1")
            .reply(200, {
              "status": "success",
              "attempt": "1",
              "id": "1",
              "request_id": "1"
            });

          scope
            .post("/user-left-segment/1")
            .reply(200, {
              "status": "success",
              "attempt": "1",
              "id": "1",
              "request_id": "1"
            });

          return scope;
        },
        response: { flow_control: { type: "next", in: 5, in_time: 10, size: 10, } },
        logs: [
          ["info", "outgoing.job.start", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }],
          ["debug", "connector.service_api.call", { "request_id": expect.whatever() },
            expect.objectContaining({"url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/1", "method": "POST"})
          ],
          ["debug", "connector.service_api.call", { "request_id": expect.whatever() },
            expect.objectContaining({"url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1", "method": "POST"})
          ],
          ["debug", "connector.service_api.call", { "request_id": expect.whatever() },
            expect.objectContaining({"url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1", "method": "POST"})
          ],
          ["info", "outgoing.user.success",
            expect.objectContaining({ "subject_type": "user", "user_email": "bob@bobby.com" }),
            expect.objectContaining({ "data": expect.objectContaining({"message_id": "message_1"}), "type": "User", "operation": "post" })
          ],
          ["info", "outgoing.user.success",
            expect.objectContaining({ "subject_type": "user", "user_email": "bob@bobby.com" }),
            expect.objectContaining({ "data": expect.objectContaining({"message_id": "message_1"}), "type": "User", "operation": "post" })
          ],
          ["info", "outgoing.user.success",
            expect.objectContaining({ "subject_type": "user", "user_email": "bob@bobby.com" }),
            expect.objectContaining({ "data": expect.objectContaining({"message_id": "message_1"}), "type": "User", "operation": "post" })
          ],
          ["info", "outgoing.job.success", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }]
        ],
        firehoseEvents:[],
        metrics: [
          ["increment", "connector.request", 1,], ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()],
          ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()],
          ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()],
        ],
        platformApiCalls: []
      });
    });
  });

  it("Send Multiple Users To Zapier", () => {
    return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
      const updateMessages = _.cloneDeep(require("./fixtures/notifier-payloads/update-single-user"));
      const private_settings = {
        ...updateMessages.connector.private_settings,
        "subscriptions": [
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/1",
            "action": "attribute_updated",
            "entityType": "user"
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/account-attribute-updated",
            "action": "attribute_updated",
            "entityType": "account"
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1",
            "action": "entered_segment",
            "entityType": "user"
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1",
            "action": "left_segment",
            "entityType": "user"
          }
        ]
      };
      const message1 =
        {
          "changes": {
            "is_new": false,
            "account": {},
            "user": {
              "attr": ["1", "2"]
            },
            "account_segments": {},
            "segments": {}
          },
          "account": {},
          "user": {
            "id": "5bd329d5e2bcf3eeaf000099",
            "name": "Bob Bobby",
            "email": "bob@bobby.com",
          },
          "account_segments": [],
          "segments": [
            {
              "id": "user_segment_1",
              "name": "UserSegment1",
              "type": "users_segment",
            }
          ],
          "message_id": "message_1"
        };

      const message2 = _.cloneDeep(message1);
      _.set(message2, "message_id", "message_2");
      _.set(message2, "changes", {
        "segments": {
          "entered": [
            {
              "id": "user_segment_1",
              "name": "UserSegment1"
            }
          ]
        }
      });

      const message3 = _.cloneDeep(message1);
      _.set(message3, "message_id", "message_3");
      _.set(message3, "changes", {
        "segments": {
          "left": [
            {
              "id": "user_segment_3",
              "name": "UserSegment3"
            }
          ]
        }
      });

      _.set(updateMessages, "messages", [
        message1,
        message2,
        message3
      ]);
      _.set(updateMessages.connector, "private_settings", private_settings);

      return _.assign(updateMessages, {
        handlerType: handlers.notificationHandler,
        handlerUrl: "smart-notifier",
        channel: "user:update",
        externalApiMock: () => {
          const scope = nock("https://hooks.zapier.com/hooks/standard/5687326");

          scope
            .post("/user-attribute-updated/1")
            .reply(200, {
              "status": "success",
              "attempt": "1",
              "id": "1",
              "request_id": "1"
            });

          scope
            .post("/user-entered-segment/1")
            .reply(200, {
              "status": "success",
              "attempt": "1",
              "id": "1",
              "request_id": "1"
            });

          scope
            .post("/user-left-segment/1")
            .reply(200, {
              "status": "success",
              "attempt": "1",
              "id": "1",
              "request_id": "1"
            });

          return scope;
        },
        response: { flow_control: { type: "next", in: 5, in_time: 10, size: 10, } },
        logs: [
          ["info", "outgoing.job.start", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }],
          ["debug", "connector.service_api.call", { "request_id": expect.whatever() },
            expect.objectContaining({"url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/1", "method": "POST"})
          ],
          ["debug", "connector.service_api.call", { "request_id": expect.whatever() },
            expect.objectContaining({"url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1", "method": "POST"})
          ],
          ["debug", "connector.service_api.call", { "request_id": expect.whatever() },
            expect.objectContaining({"url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1", "method": "POST"})
          ],
          ["info", "outgoing.user.success",
            expect.objectContaining({ "subject_type": "user", "user_email": "bob@bobby.com" }),
            expect.objectContaining({ "data": expect.objectContaining({"message_id": "message_1"}), "type": "User", "operation": "post" })
          ],
          ["info", "outgoing.user.success",
            expect.objectContaining({ "subject_type": "user", "user_email": "bob@bobby.com" }),
            expect.objectContaining({ "data": expect.objectContaining({"message_id": "message_2"}), "type": "User", "operation": "post" })
          ],
          ["info", "outgoing.user.success",
            expect.objectContaining({ "subject_type": "user", "user_email": "bob@bobby.com" }),
            expect.objectContaining({ "data": expect.objectContaining({"message_id": "message_3"}), "type": "User", "operation": "post" })
          ],
          ["info", "outgoing.job.success", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }]
        ],
        firehoseEvents:[],
        metrics: [
          ["increment", "connector.request", 1,], ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()],
          ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()],
          ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()],
        ],
        platformApiCalls: []
      });
    });
  });

});
