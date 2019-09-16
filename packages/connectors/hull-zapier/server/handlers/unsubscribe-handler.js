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
  const { url } = body;
  await helpers.settingsUpdate({
    ...private_settings,
    subscriptions: _.omitBy(private_settings.subscriptions, v => v.url === url)
  });
  return {
    status: 200,
    data: {
      ok: true
    }
  };
};

export default subscribe;
