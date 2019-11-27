// @flow
import type { HullContext, HullUserClaims } from "hull";

import getUserAttributes from "./get-user-attributes";

export default async function storeUser(
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
  const attributes = getUserAttributes(customer);
  const userClient = client.asUser(user);
  return userClient.traits(attributes, { source: "stripe" });
}
