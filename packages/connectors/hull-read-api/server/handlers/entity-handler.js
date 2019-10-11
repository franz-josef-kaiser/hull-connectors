// @flow
import type { HullContext, HullIncomingHandlerMessage } from "hull";
import _ from "lodash";
// import type { ConfResponse } from "hull-vm";

const CLAIMS = ["email", "domain", "external_id", "anonymous_id"];
const configHandler = async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): Promise<Object> => {
  const { body } = message;
  // $FlowFixMe
  const { entityType, claims, include } = body;

  // $FlowFixMe
  const filteredClaims = _.pickBy(
    claims,
    (v, k) => _.isString(v) && CLAIMS.indexOf(k) >= 0
  );
  console.log("claims", claims);
  if (_.isEmpty(claims)) {
    return {
      status: 404,
      error: "Can't search for an empty value"
    };
  }
  const isUser = entityType === "user";
  try {
    // const getter = entity === "account" ? ctx.entities.accounts : ctx.entities.users;
    const payload = await (isUser
      ? ctx.entities.users.get({
          claims: filteredClaims,
          include
        })
      : ctx.entities.accounts.get({ claims }));
    if (!payload) {
      return {
        status: 404,
        error: `Can't find ${entityType}`
      };
    }
    const { group } = ctx.client.utils.traits;

    const data = isUser
      ? {
          ...payload,
          ...(payload.user ? { user: group(payload.user) } : {}),
          ...(payload.account ? { account: group(payload.account) } : {}),
          ...(payload.events ? { events: payload.events } : {})
        }
      : {
          ...payload,
          ...(payload.account ? { account: group(payload.account) } : {})
        };

    return {
      status: 200,
      data
    };
  } catch (err) {
    console.log(err);
    ctx.client.logger.error(`fetch.${entityType}.error`, {
      error: err.message
    });
    return {
      status: 200,
      error: err.message
    };
  }
};

export default configHandler;
