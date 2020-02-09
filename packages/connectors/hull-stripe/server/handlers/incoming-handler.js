// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullExternalResponse
} from "hull";

import util from "util";
import stripe from "stripe";
import type { StripeEvent } from "../../types";

import getUserIdent from "../lib/get-user-ident";
import getEventName from "../lib/get-event-name";
import storeEvent from "../lib/store-event";
import storeUser from "../lib/store-user";
import storeAccount from "../lib/store-account";

export default async function fetchEvents(
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): HullExternalResponse {
  // $FlowFixMe
  const { event }: { event: StripeEvent } = message.body;
  if (!event) {
    return {
      status: 404,
      data: { message: "Can't find Event object inside body" }
    };
  }
  const name = getEventName(event);
  const { client, metric, connector } = ctx;
  const { private_settings = {} } = connector;
  const { use_accounts, token } = private_settings;

  try {
    if (!token) {
      const err = new Error(
        "Can't find stripe token from the credentials passed"
      );
      // $FlowFixMe
      err.status = 404;
      throw err;
    }

    const stripeClient = stripe(token);

    client.logger.debug(
      "fetchEvents.incoming",
      // $FlowFixMe
      util.inspect(event, { depth: 4 })
    );

    if (event.data.object.livemode === false && token.indexOf("live") !== -1) {
      const err = new Error("Live token with Test mode event received");
      // $FlowFixMe
      err.status = 204;
      throw err;
    }

    if (!event.data.object.customer) {
      const err = "Can't find customer inside Event object";
      // $FlowFixMe
      err.status = 404;
      throw err;
    }

    metric.increment("connector.incoming.events");

    try {
      const [customer, verifiedEvent] = await Promise.all([
        stripeClient.customers.retrieve(event.data.object.customer),
        stripeClient.events.retrieve(event.id)
      ]);
      const user = getUserIdent(ctx, customer);
      const promises = [
        storeEvent(ctx, { user, event: verifiedEvent, name }),
        storeUser(ctx, { user, customer })
      ];

      if (use_accounts) {
        promises.push(storeAccount(ctx, { user, customer }));
      }

      await Promise.all(promises);
      return { status: 200 };
    } catch (err) {
      client.logger.error("incoming.user.error", {
        message: "error fetching events",
        error: err.stack || err
      });
      return {
        status: 500,
        error: err.message
      };
    }
  } catch (err) {
    client.logger.error("incoming.user.error", {
      error: err.message,
      event
    });
    return {
      status: err.status,
      error: err.message
    };
  }
}
