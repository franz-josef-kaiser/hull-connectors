function updateStripeMapping({ token, ship, cache, smartNotifierResponse }) {
  const { private_settings = {} } = ship;
  const { stripe_user_id } = private_settings;
  if (smartNotifierResponse) {
    smartNotifierResponse.setFlowControl({
      type: "next",
      size: 100,
      in: 1
    });
  }

  if (!stripe_user_id) {
    return Promise.resolve();
  }
  // Store the token mapped to the user_id we found.
  return Promise.resolve(
    cache.cache.set(stripe_user_id, token, { ttl: 10080000 })
  );
}

module.exports = updateStripeMapping;
