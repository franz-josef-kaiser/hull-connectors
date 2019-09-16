// @flow
import type {
  HullContext,
  HullUserUpdateMessage,
  HullNotificationResponse
} from "hull";

type FlowControl = {
  flow_size?: number,
  flow_in?: number
};
const update = ({ flow_size = 100, flow_in = 10 }: FlowControl) => async (
  _ctx: HullContext,
  _messages: Array<HullUserUpdateMessage>
): HullNotificationResponse => {
  // const user_ids = _.map(messages, "user.id");
  return {
    flow_control: {
      type: "next",
      size: flow_size,
      in: flow_in
    }
  };
};
export default update;
