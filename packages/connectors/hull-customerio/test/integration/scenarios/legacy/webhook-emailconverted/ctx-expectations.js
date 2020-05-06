module.exports = (ctxMock) => {
  const userData = {
    id: "5abd08c4aede0354c3000363",
    email: "sven+dt7@hull.io"
  };
  expect(ctxMock.client.asUser.mock.calls[0])
    .toEqual([userData]);

  const event = {
    context: {
      ip: "0"
    },
    created_at: 1522340303,
    event: "Email Converted",
    event_id: "01C9S8V5C5E16R6J6T903Q3GF7",
    properties: {
      campaign_id: "12",
      campaign_name: "Started Vault Trials - 1 - Welcome, Installing and Deploying Vault",
      customer_id: "5abd08c4aede0354c3000363",
      email_address: "Sven <sven+dt7@hull.io>",
      email_id: "ZI6aBAABYnJ3muVry9xcBjL7Aj-e",
      email_subject: "How Vault Enterprise trials work",
      template_id: "35"
    }
  };

  expect(ctxMock.client.track.mock.calls).toHaveLength(1);
  expect(ctxMock.client.track.mock.calls[0])
    .toEqual([event.event, event.properties, event.context]);

  expect(ctxMock.client.logger.debug.mock.calls).toHaveLength(1);
  expect(ctxMock.client.logger.debug.mock.calls[0])
    .toEqual(["incoming.event.success", { event }]);

  expect(ctxMock.metric.increment.mock.calls).toHaveLength(1);
  expect(ctxMock.metric.increment.mock.calls[0])
    .toEqual(["ship.incoming.events", 1]);
};
