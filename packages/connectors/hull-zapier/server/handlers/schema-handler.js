// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullExternalResponse
} from "hull";

const removeTraits = key =>
  key.indexOf("traits_") === 0 ? key.substring("traits_".length) : key;

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
  // Here we actually need to return a full payload:
  // {
  //   account: {}
  //   account_segments: {}
  //   user: {}
  //   segments: {}
  // }
  // What is returned from User entity is still raw attributes from the user only,
  // with the `account.` inside etc... > should probably be done at the getSchema() level ?
  return {
    status: 200,
    data: data.map(
      ({ key, type /* configurable, visible, track_changes */ }) => {
        const clean = removeTraits(key);
        return {
          key: clean,
          label: clean,
          type
        };
      }
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
