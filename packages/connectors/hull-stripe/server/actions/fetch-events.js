const Promise = require("bluebird");
const util = require("util");
const stripe = require("stripe");

const getUserIdent = require("../lib/get-user-ident");
const getEventName = require("../lib/get-event-name");
const storeEvent = require("../lib/store-event");
const storeUser = require("../lib/store-user");
const storeAccount = require("../lib/store-account");

function fetchEvents(req, res) {
  const event = req.body;
  const name = getEventName(event);
  const { client, metric, ship } = req.hull;
  const { use_accounts } = ship.private_settings;

  const stripeClient = stripe(ship.private_settings.token);

  client.logger.debug(
    "fetchEvents.incoming",
    util.inspect(event, { depth: 4 })
  );

  if (!event.data.object.customer) {
    return res.sendStatus(204);
  }

  metric.increment("ship.incoming.events");
  return Promise.all([
    stripeClient.customers.retrieve(event.data.object.customer),
    stripeClient.events.retrieve(event.id)
  ])
    .spread((customer, verifiedEvent) => {
      const user = getUserIdent(req.hull, customer);
      const promises = [
        storeEvent({ user, event: verifiedEvent, name, hull: client }),
        storeUser({ user, customer, hull: client })
      ];
      if (use_accounts) {
        promises.push(storeAccount({ user, customer, hull: client }));
      }
      return Promise.all(promises);
    })
    .then(
      () => res.sendStatus(200),
      err => {
        client.logger.error("fetchEvents.error", err.stack || err);
        return res.sendStatus(500);
      }
    );
}

module.exports = fetchEvents;
