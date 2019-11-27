// @flow
import _ from "lodash";

export default function getUserAttributes(customer: { created: string }) {
  return {
    ..._.pick(customer, [
      "id",
      "account_balance",
      "currency",
      "delinquent",
      "description",
      "email",
      "discount"
    ]),
    created_at: customer.created
  };
}
