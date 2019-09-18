const getAccountAttributes = require("./get-account-attributes");

function storeAccount({ user, customer, hull }) {
  const attributes = getAccountAttributes(customer);
  const accountClient = hull.asUser(user).account();
  accountClient.logger.info("incoming.account.success", { attributes });
  return accountClient.traits(attributes, { source: "stripe" });
}

module.exports = storeAccount;
