const getEventContext = require("./get-event-context");
const getEventProperties = require("./get-event-properties");

function storeEvent({ user, event, name, hull }) {
  const properties = getEventProperties(event);
  const context = getEventContext(event);
  const userClient = hull.asUser(user);

  // Only track if we support this event type
  if (name) {
    userClient.logger.info("incoming.event.success", {
      name,
      properties,
      context
    });
    return userClient.track(name, properties, context);
  }
  userClient.logger.info("incoming.event.skip", { name, context });
  return "";
}

module.exports = storeEvent;
