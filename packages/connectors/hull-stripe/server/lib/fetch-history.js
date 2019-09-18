const _ = require("lodash");

const getUserIdent = require("./get-user-ident");
const getEventName = require("./get-event-name");
const storeEvent = require("./store-event");
const storeUser = require("./store-user");
const storeAccount = require("./store-account");

// Recursive event fetch method;
async function fetchEventPage(ctx, { customers, cursor }) {
  const { client, stripe } = ctx;
  const list = {
    limit: 100,
    types: [
      "charge.succeeded",
      "charge.refunded",
      "customer.subscription.updated",
      "customer.subscription.created",
      "customer.subscription.deleted"
    ]
  };
  if (cursor) list.starting_after = cursor;
  const prev_cursor = cursor;
  const response = await stripe.events.list(list);
  const { has_more, data } = response;
  client.logger.info("fetchEventPage.page", { has_more, cursor });
  const eventIds = _.map(data, event => {
    const name = getEventName(event);
    const customer = customers[event.data.object.customer];
    if (!customer) return null;
    const user = getUserIdent(ctx, customer);
    const eventId = event.id;
    storeEvent({
      user,
      event,
      name,
      hull: client
    });
    cursor = eventId;
    return eventId;
  });

  if (has_more && data.length && cursor !== prev_cursor) {
    const more = await fetchEventPage(ctx, { customers, cursor });
    return [...eventIds, ...more];
  }
  return eventIds;
}

// Recursive user fetch method;
async function fetchUserPage(ctx, { cursor } = {}) {
  const { ship, client, stripe } = ctx;
  const { private_settings } = ship;
  const { use_accounts } = private_settings;
  const list = { limit: 100 };
  if (cursor) list.starting_after = cursor;

  const response = await stripe.customers.list(list);
  const { has_more, data } = response;
  client.logger.info("fetchUserPage.page", {
    has_more,
    cursor,
    after: list.starting_after
  });
  const customerIds = _.map(data, customer => {
    const user = getUserIdent(ctx, customer);
    storeUser({ user, customer, hull: client });
    if (use_accounts) {
      storeAccount({ user, customer, hull: client });
    }
    const customerId = customer.id;
    cursor = customerId;
    return _.pick(customer, "id", "email", "metadata");
  });
  if (has_more && data.length) {
    const more = await fetchUserPage(ctx, { cursor });
    return [...customerIds, ...more];
  }
  return customerIds;
}

async function fetchHistory(ctx) {
  const { client } = ctx;
  client.logger.info("incoming.batch.start");
  try {
    const customers = await fetchUserPage(ctx);
    const customersHash = _.reduce(
      customers,
      (m, v) => {
        m[v.id] = v;
        return m;
      },
      {}
    );
    // TODO: Fix large event lists fetching.
    const response = await fetchEventPage(ctx, { customers: customersHash });
    client.logger.info("incoming.batch.success", response);
    return response;
  } catch (err) {
    client.logger.error("incoming.batch.error", err);
    return err;
  }
}

module.exports = fetchHistory;
