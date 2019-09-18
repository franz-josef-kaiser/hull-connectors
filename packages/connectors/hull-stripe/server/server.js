const bodyParser = require("body-parser");
const { notifHandler, smartNotifierHandler } = require("hull/lib/utils");

const { fetchAllHandler, oAuthHandler, statusHandler } = require("./handlers");
const stripeMiddleware = require("./lib/stripe-middleware");
const { fetchEvents } = require("./actions");
const notificationsConfiguration = require("./notifications-configuration");

function server(app, options) {
  const { Hull, hostSecret, clientSecret, clientId } = options;

  const hullMiddleware = Hull.Middleware({ hostSecret, fetchShip: true });

  app.use("/auth", oAuthHandler({ clientId, clientSecret }));

  app.post(
    "/notify",
    notifHandler({
      userHandlerOptions: {
        groupTraits: true,
        maxSize: 1,
        maxTime: 1
      },
      handlers: notificationsConfiguration
    })
  );

  app.post(
    "/smart-notifier",
    smartNotifierHandler({
      userHandlerOptions: {
        groupTraits: true,
        maxSize: 1,
        maxTime: 1
      },
      handlers: notificationsConfiguration
    })
  );

  app.post("/fetch-all", fetchAllHandler);
  app.post("/sync", fetchAllHandler);
  app.post(
    "/stripe",
    bodyParser.urlencoded({ extended: false }),
    bodyParser.json(),
    stripeMiddleware({
      Hull,
      clientSecret
    }),
    hullMiddleware,
    fetchEvents
  );

  app.post("/status", statusHandler);

  return app;
}

module.exports = server;
