const getUserAttributes = require("./get-user-attributes");

function storeUser({ user, customer, hull }) {
  const attributes = getUserAttributes(customer);
  const userClient = hull.asUser(user);
  return userClient
    .traits(attributes, { source: "stripe" })
    .then(() =>
      userClient.logger.info("incoming.user.success", { attributes })
    );
}

module.exports = storeUser;
