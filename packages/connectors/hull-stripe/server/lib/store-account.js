// @flow
import type { HullContext, HullUserClaims } from "hull";

import getAccountAttributes from "./get-account-attributes";

export default async function storeAccount(
  ctx: HullContext,
  {
    user,
    customer
  }: {
    user: HullUserClaims,
    customer: {}
  }
) {
  const { client } = ctx;
  // $FlowFixMe
  const attributes = getAccountAttributes(customer);
  return client
    .asUser(user)
    .account()
    .traits(attributes, { source: "stripe" });
}
