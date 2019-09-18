const crypt = require("./crypt");

/*
  Ensures we have a req.hull.token in the right place
  Uses reverse-mapping to find it from the redis store.
*/
function stripeMiddlewareFactory({ Hull }) {
  return async function stripeMiddleware(req, res, next) {
    const event = req.body;

    if (!event) {
      return res.sendStatus(400);
    }

    Hull.logger.info("incoming.event.start", event);

    if (!event.user_id) {
      Hull.logger.info(
        "incoming.event.warn",
        "event payload does not contain `user_id` property"
      );
      return res.sendStatus(200);
    }

    // Prevent impersonation & identity theft
    // You only can build this encrypted version of the UID coming back from oAuth.

    const uid = crypt.encrypt(event.user_id, req.hull.hostSecret);
    try {
      const token = await req.hull.cache.cache.get(uid);
      if (!token) {
        Hull.logger.error(
          "incoming.event.error",
          `can't find a user for ${event.user_id} - ${uid}`
        );
        return res.sendStatus(200);
      }
      req.hull = req.hull || {};
      req.hull.token = token;
      req.hull.config = null;
      return next();
    } catch (err) {
      Hull.logger.error("incoming.event.error", err);
      return res.sendStatus(500);
    }
  };
}

module.exports = stripeMiddlewareFactory;
