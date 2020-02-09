// @flow

import type { HullContext } from "hull";

import _ from "lodash";
import Stripe from "stripe";
import type { StripeCustomerHash } from "../../types";
import EVENTS from "../mappers/events";
import storeEvent from "./store-event";
import storeUser from "./store-user";
import storeAccount from "./store-account";

const getUserIdent = require("./get-user-ident");
const getEventName = require("./get-event-name");

// Recursive event fetch method;
async function fetchEvents(
  ctx,
  {
    stripe,
    customers
  }: {
    stripe: any,
    customers: StripeCustomerHash
  }
) {
  // eslint-disable-next-line no-restricted-syntax
  for await (const event of stripe.events.list({
    types: EVENTS
  })) {
    const name = getEventName(event);
    const customer = customers[event.data.object.customer];
    if (!customer) {
      return null;
    }
    const user = getUserIdent(ctx, customer);
    storeEvent(ctx, { user, event, name });
  }
  return true;
}

// Recursive user fetch method;
async function fetchUsers(
  ctx,
  { stripe }: { stripe: any } = {}
): StripeCustomerHash {
  const { connector } = ctx;
  const { private_settings } = connector;
  const { use_accounts } = private_settings;
  const cc = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const customer of stripe.customers.list()) {
    const user = getUserIdent(ctx, customer);
    storeUser(ctx, { user, customer });
    if (use_accounts) {
      storeAccount(ctx, { user, customer });
    }
    cc[customer.id] = _.pick(customer, "id", "email", "metadata");
  }
  return cc;
}

export default async function fetchHistory(ctx: HullContext) {
  const { connector, client } = ctx;
  const { private_settings } = connector;
  const { token } = private_settings;
  const stripe = Stripe(token);
  client.logger.info("incoming.batch.start");
  try {
    const customers = await fetchUsers(ctx, { stripe });
    await fetchEvents(ctx, {
      stripe,
      customers
    });
    return true;
  } catch (err) {
    client.logger.error("incoming.batch.error", err);
    return err;
  }
}
