// @noflow

import _ from "lodash";
import queries from "./queries";

/**
 * return { user, events, segments, pagination }
 */

module.exports = async function fetchUser({ client, search, options = {} }) {
  const { email, name, id } = search;
  let params = {};

  if (id) params = queries.id(id);
  else if (email) params = queries.email(email);
  else if (name) params = queries.name(name);

  const eventSearch = options.action && options.action.value === "events";

  client.logger.debug("outgoing.user.search", params);
  const args = await client.post("search/user_reports", params);
  const { pagination = {}, data = [] } = args;
  const [user] = data;
  if (!user || !user.id) {
    throw new Error("User not found!");
  }
  const q = [client.asUser(user.id).get("/me/segments")];
  if (eventSearch) {
    const eventParams = search.rest
      ? queries.filteredEvents(user.id, search.rest)
      : queries.events(user.id);
    client.logger.debug("outgoing.event.search", eventParams);
    q.push(client.post("search/events", eventParams));
  }
  const [segments, events = {}] = await Promise.all(q);
  if (eventSearch && !events.data.length)
    return {
      message: `\n Couldn't find "${search.rest}" events for ${
        user.name
      } - Search is case-sensitive`
    };

  if (!user) return { message: "Couldn't find anyone!" };

  const { account } = user;
  return {
    user: _.omit(user, "account"),
    account,
    events: events.data,
    segments,
    pagination
  };
};
