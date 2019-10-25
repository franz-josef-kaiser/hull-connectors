// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullGetEntityParams
} from "hull";
import _ from "lodash";
// import type { ConfResponse } from "hull-vm";

const configHandler = async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): Promise<Object> => {
  const { body } = message;
  // $FlowFixMe
  const params: HullGetEntityParams = body;
  const { search, entity, claims, include, per_page, page } = params;

  if (_.isEmpty(claims)) {
    return {
      status: 404,
      error: "Can't search for an empty value"
    };
  }
  const isUser = entity === "user";
  try {
    // const getter = entity === "account" ? ctx.entities.accounts : ctx.entities.users;
    const payload = await ctx.entities.get({
      claims,
      entity,
      per_page,
      page,
      include
    });
    // if (!payload.data || !payload.data.length) {
    //   return {
    //     status: 404,
    //     error: `Can't find ${entity}`
    //   };
    // }
    const { group } = ctx.client.utils.traits;

    const data = payload.data.map(p => {
      const { user, account, events } = p;
      return isUser
        ? {
            ...p,
            ...(user ? { user: group(user) } : {}),
            ...(account ? { account: group(account) } : {}),
            ...(events ? { events } : {})
          }
        : {
            ...p,
            ...(account ? { account: group(account) } : {})
          };
    });

    return {
      status: 200,
      data: {
        ...payload,
        data
      }
    };
  } catch (err) {
    console.log(err);
    ctx.client.logger.error(`fetch.${entity}.error`, {
      error: err.message
    });
    return {
      status: 200,
      error: err.message
    };
  }
};

export default configHandler;
