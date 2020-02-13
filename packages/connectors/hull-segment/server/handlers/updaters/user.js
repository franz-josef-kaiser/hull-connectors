// @flow

import type { HullContext, HullUserUpdateMessage } from "hull";
import _ from "lodash";
import type { SegmentContext } from "../../types";

import {
  getfirstNonNull,
  getFirstAnonymousIdFromEvents
} from "../../lib/utils";
import handleEvent from "./event";
import handleAccount from "./account";

const debug = require("debug")("hull-segment:user-updater");

const segmentContext: SegmentContext = { active: false, ip: 0 };
const integrations = { Hull: false };

const userUpdate = (ctx: HullContext, analytics: any) => async (
  message: HullUserUpdateMessage
): any => {
  const { client, connector, metric, helpers } = ctx;
  const { segmentChangesToEvents, mapAttributes } = helpers;
  const { settings = {}, private_settings = {} } = connector;
  const {
    synchronized_segments,
    synchronized_account_segments
  } = private_settings;
  const { public_id_field, public_account_id_field } = settings;
  const { user, account, events = [] } = message;

  // Empty payload ?
  if (!user.id || !connector.id) {
    throw new Error("Missing User or connector");
  }

  const asUser = client.asUser(user);

  // Look for an anonymousId
  // if we have events in the payload, we take the annymousId of the first event
  // Otherwise, we look for known anonymousIds attached to the user and we take the first one
  const anonymousId =
    getFirstAnonymousIdFromEvents(events) ||
    getfirstNonNull(user.anonymous_ids);

  // $FlowFixMe
  const userId: void | null | string = _.get(user, public_id_field);
  // const groupId: void | null | string = account.id;
  const groupId: ?string = _.get(account, public_account_id_field);

  // We have no identifier for the user, we have to skip
  if (!userId && !anonymousId) {
    return asUser.logger.info("outgoing.user.skip", {
      message: "No Identifier available",
      anonymousId,
      userId,
      public_id_field,
      anonymousIds: user.anonymous_ids
    });
  }

  const traits = mapAttributes({
    payload: message,
    mapping: connector.private_settings.outgoing_user_attribute_mapping,
    direction: "outgoing"
  });

  const promises = [];

  try {
    promises.push(
      analytics.identify({
        anonymousId,
        userId,
        traits,
        context: segmentContext,
        integrations
      })
    );
  } catch (err) {
    debug("Error in Identify handler", { message, err });
    err.reason = "Error sending Identify to Segment.com";
    err.data = { userId, user };
    throw err;
  }

  metric.increment("ship.service_api.call", 1, ["type:identify"]);

  try {
    promises.push(
      ...events.map(
        handleEvent({
          ctx,
          asUser,
          active: true,
          traits,
          analytics,
          anonymousId,
          userId,
          groupId
        })
      )
    );
  } catch (err) {
    debug("Error in Event handler", { message, err });
    err.reason = "Error sending Tracks to Segment.com";
    throw err;
  }

  try {
    promises.push(
      ...segmentChangesToEvents(
        message,
        _.concat(synchronized_segments, synchronized_account_segments)
      ).map(
        handleEvent({
          ctx,
          asUser,
          active: false,
          traits,
          analytics,
          anonymousId,
          userId,
          groupId
        })
      )
    );
  } catch (err) {
    debug("Error in Segment Change handler", { message, err });
    err.reason = "Error sending Tracks to Segment.com";
    throw err;
  }

  const accountUpdateHandler = handleAccount(ctx, analytics);
  try {
    promises.push(accountUpdateHandler(message, userId, anonymousId, groupId));
  } catch (err) {
    debug("Error in Account Update Handler", { message, err });
    err.reason = "Error sending group to Segment.com";
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    debug("Error in Promise callback Handler", { message, err });
    err.reason = "Error sending events and Users to segment";
    throw err;
  }

  return undefined;
};

export default userUpdate;
