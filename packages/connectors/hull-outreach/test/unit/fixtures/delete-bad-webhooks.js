module.exports = {
  configuration: {
    id: "5d51b4ebc07907e865025a7b",
    secret: "shhhhhh",
    organization: "organization.hullapp.io",
    hostname: "225ddbbc.connector.io",
    private_settings: {}
  },
  route: "status",
  serviceRequests: [
    {
      localContext: [expect.objectContaining({ webhookIdToDelete: 93 })],
      name: "outreach",
      op: "deleteWebhook",
      result: {
        status: 200
      }
    },
    {
      localContext: expect.anything(),
      name: "hull",
      op: "settingsUpdate",
      input: { webhook_id: 94 },
      result: {
        status: 200
      }
    },
    {
      localContext: [{
        "webhookUrl": "https://225ddbbc.connector.io/webhooks?organization=organization.hullapp.io&secret=shhhhhh&ship=5d51b4ebc07907e865025a7b"
      }],
      name: "outreach",
      op: "getAllWebhooks",
      result: {
        status: 200,
        body: {
          data: [
            {
              type: "webhook",
              id: 63,
              attributes: {
                action: "*",
                active: true,
                createdAt: "2019-04-30T21:49:11.000Z",
                resource: "*",
                secret: null,
                updatedAt: "2019-04-30T21:49:11.000Z",
                url:
                  "https://dev-hull-outreach.connector.io/webhooks?organization=431c6b01.hullapp.io&secret=28b91ad83985f340e24e1bc83b69ac45&ship=5cc8c28fcdeec5bb01000339"
              },
              relationships: {
                authorizer: { data: { type: "user", id: 1 } },
                creator: { data: { type: "user", id: 1 } },
                updater: { data: { type: "user", id: 1 } }
              },
              links: { self: "https://api.outreach.io/api/v2/webhooks/63" }
            },
            {
              type: "webhook",
              id: 93,
              attributes: {
                action: "*",
                active: true,
                createdAt: "2019-08-12T18:50:53.000Z",
                resource: "*",
                secret: null,
                updatedAt: "2019-08-12T18:50:53.000Z",
                url:
                  "https://225ddbbc.connector.io/webhooks?organization=organization.hullapp.io&secret=shhhhhh&ship=otherdeletedship"
              },
              relationships: {
                authorizer: { data: { type: "user", id: 1 } },
                creator: { data: { type: "user", id: 1 } },
                updater: { data: { type: "user", id: 1 } }
              },
              links: { self: "https://api.outreach.io/api/v2/webhooks/94" }
            },
            {
              type: "webhook",
              id: 94,
              attributes: {
                action: "*",
                active: true,
                createdAt: "2019-08-12T18:50:53.000Z",
                resource: "*",
                secret: null,
                updatedAt: "2019-08-12T18:50:53.000Z",
                url:
                  "https://225ddbbc.connector.io/webhooks?organization=organization.hullapp.io&secret=shhhhhh&ship=5d51b4ebc07907e865025a7b"
              },
              relationships: {
                authorizer: { data: { type: "user", id: 1 } },
                creator: { data: { type: "user", id: 1 } },
                updater: { data: { type: "user", id: 1 } }
              },
              links: { self: "https://api.outreach.io/api/v2/webhooks/94" }
            }
          ],
          meta: { count: 5 }
        }
      }
    }
  ],
  result: {}
};
