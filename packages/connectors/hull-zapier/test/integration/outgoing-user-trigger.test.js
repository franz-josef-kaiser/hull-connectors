/* @flow */
const _ = require("lodash");

process.env.CLIENT_ID = "1234";
process.env.CLIENT_SECRET = "1234";
const testScenario = require("hull-connector-framework/src/test-scenario");
import connectorConfig from "../../server/config";

describe("Outgoing Users Tests", () => {

  it("Whitelisted User Attribute Changed. Send User To Single Zap", () => {
    return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
      const updateMessages = _.cloneDeep(require("./fixtures/notifier-payloads/update-single-user"));
      const private_settings = {
        ...updateMessages.connector.private_settings,
        "subscriptions": [
         {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/1",
            "action": "attribute_updated",
            "entityType": "user",
            "inputData": {
              "user_attributes": [ "pipedrive/department", "pipedrive/description" ],
              "user_segments": [ "user_segment_1" ],
              "account_attributes": [],
              "account_segments": [ "all_account_segments" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/2",
            "action": "attribute_updated",
            "entityType": "user",
            "inputData": {
              "user_attributes": [ "pipedrive/status", "pipedrive/random" ],
              "user_segments": [ "user_segment_1" ],
              "account_attributes": [],
              "account_segments": [ "all_account_segments" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/account-attribute-updated/1",
            "action": "attribute_updated",
            "entityType": "account",
            "inputData": {
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1", "all_account_segments" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1",
            "action": "entered_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          }
        ]
      };
      const message1 =
        {
          "changes": {
            "is_new": false,
            "account": {},
            "user": {
              "pipedrive/department": ["marketing", "sales"],
              "blacklistattr_1": ["", "1"],
              "blacklistattr_2": ["", "1"],
              "blacklistattr_3": ["", "1"]
            },
            "account_segments": {},
            "segments": {}
          },
          "account": {},
          "user": {
            "id": "5bd329d5e2bcf3eeaf000099",
            "name": "Bob Bobby",
            "email": "bob@bobby.com",
            "pipedrive/department": "sales"
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

  it("Send New User in Whitelisted Segments To Multiple Zaps", () => {
    return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
      const updateMessages = _.cloneDeep(require("./fixtures/notifier-payloads/update-single-user"));
      const private_settings = {
        ...updateMessages.connector.private_settings,
        "subscriptions": [
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-created/1",
            "action": "created",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_3" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-created/2",
            "action": "created",
            "entityType": "user",
            "inputData": {
              "user_segments": ["user_segment_2", "user_segment_500"]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-created/3",
            "action": "created",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_6", "user_segment_7" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/account-attribute-updated",
            "action": "attribute_updated",
            "entityType": "account",
            "inputData": {
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_12213" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1",
            "action": "entered_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_112341234", "user_segment_212341324" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1",
            "action": "left_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1123414", "user_segment_212341234" ]
            }
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
            },
            {
              "id": "user_segment_2",
              "name": "UserSegment2",
              "type": "users_segment",
            },
            {
              "id": "user_segment_3",
              "name": "UserSegment3",
              "type": "users_segment",
            },
            {
              "id": "user_segment_4",
              "name": "UserSegment5",
              "type": "users_segment",
            },
            {
              "id": "user_segment_5",
              "name": "UserSegment5",
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

          scope
            .post("/user-created/2")
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
          ["debug", "connector.service_api.call", { "request_id": expect.whatever() },
            expect.objectContaining({"url": "https://hooks.zapier.com/hooks/standard/5687326/user-created/2", "method": "POST"})
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
        metrics: [["increment", "connector.request", 1,], ["increment", "ship.service_api.call", 1,], ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()], ["value", "connector.service_api.response_time", expect.whatever()]],
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
            "entityType": "user",
            "inputData": {
              "user_attributes": [ "pipedrive/department", "pipedrive/description" ],
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1", "all_account_segments" ],
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/account-attribute-updated",
            "action": "attribute_updated",
            "entityType": "account",
            "inputData": {
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1", "all_account_segments" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1",
            "action": "entered_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1",
            "action": "left_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_2", "user_segment_3" ]
            }
          }
        ]
      };
      const message1 =
        {
          "changes": {
            "is_new": false,
            "account": {},
            "user": {
              "pipedrive/department": ["marketing", "sales"],
              "blacklistattr_1": ["", "1"],
              "blacklistattr_2": ["", "1"],
              "blacklistattr_3": ["", "1"]
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
            "entityType": "user",
            "inputData": {
              "user_attributes": [ "pipedrive/department", "pipedrive/description" ],
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1", "all_account_segments" ],
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/2",
            "action": "attribute_updated",
            "entityType": "user",
            "inputData": {
              "user_attributes": [ "pipedrive/department", "pipedrive/description" ],
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1" ],
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/account-attribute-updated",
            "action": "attribute_updated",
            "entityType": "account",
            "inputData": {
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1", "all_account_segments" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1",
            "action": "entered_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1",
            "action": "left_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_3" ]
            }
          }
        ]
      };
      const message1 =
        {
          "changes": {
            "is_new": false,
            "account": {},
            "user": {
              "pipedrive/department": ["marketing", "sales"],
              "blacklistattr_1": ["", "1"],
              "blacklistattr_2": ["", "1"],
              "blacklistattr_3": ["", "1"]
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

  it("User enters non-whitelisted segment but is in whitelisted segment. Should not send to zapier.", () => {
    return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
      const updateMessages = _.cloneDeep(require("./fixtures/notifier-payloads/update-single-user"));
      const private_settings = {
        ...updateMessages.connector.private_settings,
        "subscriptions": [
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/1",
            "action": "attribute_updated",
            "entityType": "user",
            "inputData": {
              "user_attributes": [ "pipedrive/department", "pipedrive/description" ],
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1", "all_account_segments" ],
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/account-attribute-updated",
            "action": "attribute_updated",
            "entityType": "account",
            "inputData": {
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1", "all_account_segments" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1",
            "action": "entered_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1",
            "action": "left_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_2", "user_segment_3" ]
            }
          }
        ]
      };
      const message1 =
        {
          "changes": {
            "is_new": false,
            "account": {},
            "user": {},
            "account_segments": {},
            "segments": {
              "left": [],
              "entered": [
                {
                  "id": "user_segment_3",
                  "name": "UserSegment3"
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
        externalApiMock: () => {},
        response: { flow_control: { type: "next", in: 5, in_time: 10, size: 10, } },
        logs: [
          ["info", "outgoing.job.start", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }],
          ["info", "outgoing.job.success", { "request_id": expect.whatever() }, { "jobName": "Outgoing Data", "type": "user" }]
        ],
        firehoseEvents:[],
        metrics: [
          ["increment", "connector.request", 1,],
        ],
        platformApiCalls: []
      });
    });
  });

  it("Account on the user has a whitelisted attribute change and all validations pass. Should send to zapier.", () => {
    return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
      const updateMessages = _.cloneDeep(require("./fixtures/notifier-payloads/update-single-user"));
      const private_settings = {
        ...updateMessages.connector.private_settings,
        subscriptions: [
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-attribute-updated/1",
            "action": "attribute_updated",
            "entityType": "user",
            "inputData": {
              "user_attributes": [ "pipedrive/department", "pipedrive/description" ],
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1", "all_account_segments" ],
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/account-attribute-updated",
            "action": "attribute_updated",
            "entityType": "account",
            "inputData": {
              "account_attributes": [ "pipedrive/industry" ],
              "account_segments": [ "account_segment_id_1", "all_account_segments" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-entered-segment/1",
            "action": "entered_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_2" ]
            }
          },
          {
            "url": "https://hooks.zapier.com/hooks/standard/5687326/user-left-segment/1",
            "action": "left_segment",
            "entityType": "user",
            "inputData": {
              "user_segments": [ "user_segment_1", "user_segment_2", "user_segment_3" ]
            }
          }
        ]
      };
      const message1 =
        {
          "changes": {
            "is_new": false,
            "account":  {
              "pipedrive/industry": ["it", "IT"],
              "blacklistattr_1": ["", "1"],
              "blacklistattr_2": ["", "1"],
              "blacklistattr_3": ["", "1"]
            },
            "user": {
              "blacklistattr_1": ["", "1"],
              "blacklistattr_2": ["", "1"],
              "blacklistattr_3": ["", "1"]
            },
            "account_segments": {},
            "segments": {}
          },
          "account": {
            "id": "145245141",
            "domain": "bobby.com",
            "pipedrive/industry": "IT",
          },
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
          return scope
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
        metrics: [
          ["increment", "connector.request", 1,],
          ["increment", "ship.service_api.call", 1,], ["value", "connector.service_api.response_time", expect.whatever()],
        ],
        platformApiCalls: []
      });
    });
  });

  /*it("Webhook Not Valid - Should Unsubscribe", () => {
    return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {

    });
  });*/
});
