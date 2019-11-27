// @flow
import type { HullContext, HullAccountClaims } from "hull";

import getAccountAttributes from "./get-account-attributes";

export default async function storeAccount(
  ctx: HullContext,
  {
    user,
    customer
  }: {
    user: HullAccountClaims,
    customer: {}
  }
) {
  const { client } = ctx;
  // $FlowFixMe
  const attributes = getAccountAttributes(customer);
  const accountClient = client.asUser(user).account();
  return accountClient.traits(attributes, { source: "stripe" });
}
