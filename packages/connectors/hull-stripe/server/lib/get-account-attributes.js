// @flow
import _ from "lodash";

function getUserAttributes(customer: { created: string }) {
  return {
    ..._.pick(customer, [
      "id",
      "account_balance",
      "currency",
      "delinquent",
      "description",
      "discount"
    ]),
    created_at: customer.created
  };
}

module.exports = getUserAttributes;
