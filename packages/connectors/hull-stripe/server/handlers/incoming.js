// @flow
import Stripe from "stripe";
import util from "util";
import type { HullContext, HullIncomingHandlerMessage } from "hull";

import getUserIdent from "../lib/get-user-ident";
import getEventName from "../lib/get-event-name";
import storeEvent from "../lib/store-event";
import storeUser from "../lib/store-user";
import storeAccount from "../lib/store-account";

export default async function fetchEvents(
  ctx: HullContext,
  message: HullIncomingHandlerMessage
) {
  // $FlowFixMe
  const event: { data: {}, id: string } = message.body;
  const { data, id } = event;
  const name = getEventName(event);
  const { client, connector } = ctx;
  const { private_settings } = connector;
  const { use_accounts, token } = private_settings;

  const stripe = Stripe(token);

  client.logger.debug("fetchEvents.incoming", {
    data: util.inspect(event, { depth: 4 })
  });

  if (
    !data.object.customer ||
    (data.object.livemode === false && token.indexOf("live") !== -1)
  ) {
    return {
      status: 204,
      data: {}
    };
  }

  try {
    const [customer, verifiedEvent] = await Promise.all([
      stripe.customers.retrieve(data.object.customer),
      stripe.events.retrieve(id)
    ]);
    const user = getUserIdent(ctx, customer);
    const promises = [
      storeEvent({ user, event: verifiedEvent, name, hull: client }),
      storeUser({ user, customer, hull: client })
    ];
    if (use_accounts) {
      promises.push(storeAccount({ user, customer, hull: client }));
    }
    return {
      status: 200
    };
  } catch (err) {
    client.logger.error("fetchEvents.error", err.stack || err);
    return {
      status: 500,
      error: err.message
    };
  }
}
