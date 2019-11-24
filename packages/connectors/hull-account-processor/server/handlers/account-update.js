// @flow
import type {
  HullContext,
  HullAccountUpdateMessage,
  HullNotificationResponse
} from "hull";
import _ from "lodash";
import { asyncComputeAndIngest, getClaims, varsFromSettings } from "hull-vm";

type FlowControl = {
  flow_size?: number,
  flow_in?: number
};
const update = ({ flow_size = 100, flow_in = 10 }: FlowControl) => async (
  ctx: HullContext,
  messages: Array<HullAccountUpdateMessage>
): HullNotificationResponse => {
  const { connector, client } = ctx;
  const { private_settings = {} } = connector;
  const { code = "" } = private_settings;
  const { group } = client.utils.traits;

  // const user_ids = _.map(messages, "user.id");
  try {
    await Promise.all(
      messages.map(payload =>
        asyncComputeAndIngest(ctx, {
          payload: _.omitBy(
            {
              ...payload,
              variables: varsFromSettings(ctx),
              account: group(payload.account)
            },
            _.isUndefined
          ),
          source: "processor",
          code,
          claims: getClaims("account", payload),
          entity: "account",
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
    ctx.client.logger.error("incoming.account.error", { error: err.message });
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
