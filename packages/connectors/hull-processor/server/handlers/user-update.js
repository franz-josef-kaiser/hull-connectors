// @flow
import type {
  HullContext,
  HullUserUpdateMessage,
  HullNotificationResponse
} from "hull";
import _ from "lodash";
import { asyncComputeAndIngest, getClaims, varsFromSettings } from "hull-vm";

const update = ({
  flow_size,
  flow_in
}: {
  flow_size: number | string,
  flow_in: number | string
}) => async (
  ctx: HullContext,
  messages: Array<HullUserUpdateMessage>
): HullNotificationResponse => {
  const { connector, client } = ctx;
  const { private_settings = {} } = connector;
  const { code = "", language = "javascript" } = private_settings;
  const { group } = client.utils.traits;

  try {
    await Promise.all(
      messages.map(payload =>
        asyncComputeAndIngest(ctx, {
          payload: _.omitBy(
            {
              changes: {},
              events: [],
              ...payload,
              variables: varsFromSettings(ctx),
              user: group(payload.user),
              account: group(payload.account)
            },
            _.isUndefined
          ),
          source: "processor",
          language,
          code,
          claims: getClaims("user", payload),
          entity: "user",
          preview: false
        })
      )
    );
    return {
      flow_control: {
        type: "next",
        size: flow_size,
        in: flow_in
      }
    };
  } catch (err) {
    ctx.client.logger.error("incoming.user.error", { error: err.message });
    return {
      flow_control: {
        type: "retry",
        size: flow_size,
        in: flow_in
      }
    };
  }
};
export default update;
