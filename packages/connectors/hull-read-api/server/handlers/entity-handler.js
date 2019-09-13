// @flow
import type { HullContext, HullIncomingHandlerMessage } from "hull";
import _ from "lodash";
// import type { ConfResponse } from "hull-vm";

const configHandler = async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): Promise<Object> => {
  const { body } = message;
  // $FlowFixMe
  const { email, domain, external_id, anonymous_id, entityType, events } = body;
  const claims = _.pickBy(
    { email, domain, external_id, anonymous_id },
    _.isString
  );
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
          claims,
          include: {
            events: {
              names: events,
              per_page: 20,
              page: 1
            }
          }
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
          user: group(payload.user),
          account: group(payload.account || {}),
          events: payload.events || []
        }
      : {
          ...payload,
          account: group(payload.account || {})
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
