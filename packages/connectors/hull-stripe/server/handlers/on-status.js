// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullSettingsResponse
} from "hull";
import Stripe from "stripe";

const onStatus = (clientSecret: string) => async (
  ctx: HullContext,
  _incomingMessages: HullIncomingHandlerMessage
): HullSettingsResponse => {
  const { connector, helpers } = ctx;
  const { decrypt } = helpers;
  const { private_settings = {} } = connector;
  const { token, stripe_user_id } = private_settings;
  try {
    let uid;
    try {
      uid = decrypt(stripe_user_id);
    } catch (e) {
      throw new Error("Couldn't decrypt Stripe User ID");
    }

    if (!token || !uid) {
      throw new Error("Please log in with Stripe");
    }

    const account = await Stripe(clientSecret).account.retrieve(uid);

    const { business_name /* , _business_logo = "" */ } = account;

    if (token && business_name) {
      return {
        status: 200,
        data: {
          message: `Connected to ${business_name}`,
          html: `Connected to <span>${business_name}</span>`
        }
      };
    }
    return {
      status: 400,
      data: {
        message: "Error when checking status. Contact the Hull Team"
      }
    };
  } catch (e) {
    return {
      status: 400,
      data: {
        message: e.message
      }
    };
  }
};

export default onStatus;
