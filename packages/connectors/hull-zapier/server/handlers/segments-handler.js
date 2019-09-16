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
  // $FlowFixMe
  const { entityType } = body;
  const data = await ctx.entities[
    entityType === "account" ? "accounts" : "users"
  ].getSegments();
  return {
    status: 200,
    data: data.map(({ name, id }) => ({ [id]: name }))
  };
};

// {
//   id: "5c5475bbcb49e0db0201c760",
//   name: "Customers CDP",
//   query: {
//     ...
//   },
//   type: "accounts_segment",
//   predicate: {
//     ...
//   },
//   stats: { accounts: 51 },
//   created_at: "2019-02-01T16:37:15Z",
//   updated_at: "2019-08-29T20:33:01Z",
//   fields_list: ["name", "domain", "created_at", "salesforce/type"],
//   referenced_attributes: ["salesforce/type", "domain"],
//   referenced_events: [],
//   version: { revision: null, created_at: "2019-08-29T20:33:01Z" }
// }

export default credentials;
