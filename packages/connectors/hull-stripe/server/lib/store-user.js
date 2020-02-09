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
  return (
    client
      .asUser(user)
      // $FlowFixMe
      .traits(getUserAttributes(customer), { source: "stripe" })
  );
}
