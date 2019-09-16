// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullExternalResponse
} from "hull";

const credentials = async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): HullExternalResponse => {
  const { body } = message;
  const { entityType } = body;
  const handler =
    (entityType === "account" && "accounts") ||
    (entityType === "user_event" && "events") ||
    "users";
  const data = await ctx.entities[handler].getSchema();
  return {
    status: 200,
    data: data.map(
      ({ key, type /* configurable, visible, track_changes */ }) => ({
        key,
        label: key,
        type
      })
    )
  };
};

// {
//   "key": "account.id",
//   "type": "string",
//   "configurable": false,
//   "visible": true,
//   "track_changes": false
// },
//
// {
//   key: 'id',
//   label: 'Recipe ID',
//   type: 'integer'
// },

export default credentials;
