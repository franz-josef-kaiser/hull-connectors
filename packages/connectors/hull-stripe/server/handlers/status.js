// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullStatusResponse
} from "hull";

const statusHandler = async (
  ctx: HullContext,
  _incomingMessages: HullIncomingHandlerMessage
): HullStatusResponse => {
  // const { connector, client } = ctx;
  // const { private_settings } = connector;

  return {
    status: "ok",
    messages: ""
  };
};

export default statusHandler;
