// @flow
import type { HullContext, HullUserClaims } from "hull";
import type { StripeCustomer } from "../../types";

/**
 * Builds claims for `hull.as()` method.
 *
 * @param  {Object} ctx      Context object
 * @param  {Object} customer [description]
 * @return {mixed} object { external_id, anonymous_id } or { email, anonymous_id } or "id"
 */

function getUserIdent(
  ctx: HullContext,
  customer: StripeCustomer
): HullUserClaims {
  const { connector } = ctx;
  const { private_settings = {} } = connector;
  const { metadata_id_parameter, id_parameter } = private_settings;
  const { metadata = {}, email, id } = customer;
  const param = metadata[metadata_id_parameter];
  return {
    anonymous_id: `stripe:${id}`,
    ...(email ? { email } : {}),
    ...(param ? { [id_parameter]: param } : {})
  };
}

module.exports = getUserIdent;
