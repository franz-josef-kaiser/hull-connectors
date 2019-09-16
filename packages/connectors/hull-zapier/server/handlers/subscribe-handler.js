// @flow
import type {
  HullContext,
  HullExternalResponse,
  HullIncomingHandlerMessage
} from "hull";
import _ from "lodash";

const subscribe = async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): HullExternalResponse => {
  const { connector, helpers } = ctx;
  const { private_settings } = connector;
  const { body } = message;
  // $FlowFixMe
  const { url, segments, action, entityType, value } = body;

  // [ { url, action, entityType, value } ]
  const subscription = { url, segments, action, entityType, value };
  await helpers.settingsUpdate({
    ...private_settings,
    subscriptions: _.uniqBy(
      [...private_settings.subscriptions, subscription],
      "url"
    )
  });
  return {
    status: 200,
    data: subscription
  };
};

export default subscribe;
