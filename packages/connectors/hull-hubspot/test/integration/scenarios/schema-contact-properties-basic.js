// @flow

import connectorConfig from "../../../server/config";

const testScenario = require("hull-connector-framework/src/test-scenario");

process.env.OVERRIDE_HUBSPOT_URL = "";
process.env.CLIENT_ID = "1234";
process.env.CLIENT_SECRET = "1234";

const connector = {
  private_settings: {
    token: "hubToken",
    mark_deleted_contacts: false,
    mark_deleted_companies: false
  }
};

it("Should fetch contact groups and properties and transform it to attribute mapping", () => {
  const domain = "hull.io";
  return testScenario({ connectorConfig }, ({ handlers, nock, expect }) => {
    return {
      handlerType: handlers.jsonHandler,
      handlerUrl: "schema/contact_properties",
      externalApiMock: () => {
        const scope = nock("https://api.hubapi.com");
        scope.get("/contacts/v2/groups?includeProperties=true").reply(200, [
          {
            "name": "contactinformation",
            "displayName": "Contact Information",
            "properties": [
              {
                "name": "job_function",
                "label": "Job function",
                "groupName": "contactinformation",
                "type": "string",
                "fieldType": "text",
                "formField": true,
                "readOnlyValue": false
              }
            ]
          },
          {
            "name": "hull",
            "displayName": "Hull Properties",
            "properties": [
              {
                "name": "hull_segments",
                "label": "Hull Segments",
                "groupName": "hull",
                "type": "enumeration",
                "fieldType": "checkbox",
                "hidden": false,
                "options": [
                  {
                    "readOnly": false,
                    "label": "HubspotUsers",
                    "hidden": false,
                    "value": "HubspotUsers",
                  }
                ],
                "formField": false,
                "readOnlyValue": false
              }
            ]
          }
        ]);
        return scope;
      },
      connector,
      usersSegments: [],
      accountsSegments: [],
      response: {
        options: [
          {
            label: "Contact Information",
            options: [
              {
                label: "Job function",
                value: "job_function"
              }
            ]
          },
          {
            label: "Hull Properties",
            options: [
              {
                label: "Hull Segments",
                value: "hull_segments"
              }
            ]
          },
          {
            label: "Contact Meta",
            options: [
              {
                label: "Merged Vids",
                value: "contact_meta.merged-vids"
              }
            ]
          }
        ]
      },
      logs: [
        [
          "debug",
          "connector.service_api.call",
          expect.whatever(),
          expect.objectContaining({
            method: "GET",
            status: 200,
            url: "/contacts/v2/groups"
          })
        ]
      ],
      firehoseEvents: [],
      metrics: [
        ["increment", "connector.request", 1],
        ["increment", "ship.service_api.call", 1],
        ["value", "connector.service_api.response_time", expect.any(Number)]
      ],
      platformApiCalls: [
        ["GET", "/api/v1/app", {}, {}],
        [
          "GET",
          "/api/v1/users_segments?shipId=9993743b22d60dd829001999",
          expect.whatever(),
          {}
        ],
        [
          "GET",
          "/api/v1/accounts_segments?shipId=9993743b22d60dd829001999",
          expect.whatever(),
          {}
        ]
      ]
    };
  });
});
