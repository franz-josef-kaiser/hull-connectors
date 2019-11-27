// @flow
import type { HullContext } from "hull";

export default async function updateStripeMapping(ctx: HullContext) {
  const { token, connector, cache } = ctx;
  const { private_settings = {} } = connector;
  const { stripe_user_id } = private_settings;

  // Store the token mapped to the user_id we found.
  await cache.cache.set(stripe_user_id, token, { ttl: 10080000 });
  return {
    type: "next",
    size: 100,
    in: 1
  };
}
