// @flow
import type {
  HullEntityType,
  HullAccountUpdateMessage,
  HullUserUpdateMessage
} from "../types";

import fp from "lodash/fp";
import _ from "lodash";

// const _ = require("lodash");

const replace = (value, key) => key.replace(/^traits_/, "");

const groupByType = type =>
  fp.groupBy(type === "user" ? "user.id" : "account.id");
const sortByIndexedAt = type =>
  fp.sortBy(type === "user" ? "user.indexed_at" : "account.indexed_at");
const sortAndTakeLast = fp.flow(
  fp.sortBy("created_at"),
  fp.last
);

const getUniqueEvents = fp.flow(
  fp.map("events"),
  fp.flatten,
  fp.groupBy("event_id"),
  fp.values,
  fp.map(sortAndTakeLast)
);
type Tuple = [any, any];

const getMergedChanges = (messages: Array<HullUserUpdateMessage>) =>
  _.reduce(
    _.map(messages, "changes"),
    (changeset, changes, _key: string) => {
      _.map(changes, (attributes: { [string]: Tuple }, objectType: string) => {
        _.map(attributes, (attributeChangeSet: Tuple, attributeKey: string) => {
          // TODO. Handle segment changes
          // attempt to fetch initial value from previous change or get intial value from this change
          const prev = _.get(
            changeset,
            [objectType, attributeKey, 0],
            attributeChangeSet[0]
          );
          if (prev === attributeChangeSet[1]) {
            _.unset(changeset, [objectType, attributeKey]);
          } else {
            // set the pair to be the oldest intial value, and the newest final value
            _.set(
              changeset,
              [objectType, attributeKey],
              [prev, attributeChangeSet[1]]
            );
          }
        });
      });
      return changeset;
    },
    {}
  );

const mergeMessages = messages => ({
  ...fp.merge(...messages),
  events: getUniqueEvents(messages),
  changes: getMergedChanges(messages)
});

const getUniqueMessages = type =>
  fp.flow(
    groupByType(type),
    fp.values,
    fp.map(mergeMessages)
  );

function dedupeMessages<T: HullUserUpdateMessage | HullAccountUpdateMessage>(
  messages: Array<T>,
  type: HullEntityType
): Array<T> {
  if (!messages || messages.length < 2) {
    return messages;
  }

  return getUniqueMessages(type)(messages);

  const groupedMessages = _.groupBy(
    messages,
    type === "user" ? "user.id" : "account.id"
  );

  const res = {
    ...userMessage
  };
  res.user = _.mapKeys(userMessage.user, replace);
  if (userMessage.changes && userMessage.changes.user) {
    res.changes = {
      ...userMessage.changes,
      user: _.mapKeys(userMessage.changes.user, replace)
    };
  }
  return res;
}

module.exports = dedupeMessages;
