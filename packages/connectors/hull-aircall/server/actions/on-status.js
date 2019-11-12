// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullSettingsResponse
} from "hull";

const statusHandler = async (
  ctx: HullContext,
  _incomingMessages: HullIncomingHandlerMessage
): HullSettingsResponse => {
  const { connector } = ctx;
  const { private_settings = {} } = connector;
  const { access_token, company_name } = private_settings;
  if (!access_token) {
    return {
      status: 400,
      data: {
        message: "Not Connected"
      }
    };
  }

  return {
    status: 200,
    data: {
      message: `Connected to team ${company_name}`,
      html: `Connected to team <span>${company_name}</span>`
    }
  };
};

export default statusHandler;
