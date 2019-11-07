// @flow
import type { HullHandlersConfiguration } from "hull";

import Strategy from "passport-aircall";
import incomingHandler from "./incoming-handler";
import statusHandler from "./status-handler";
import onStatus from "../actions/on-status";
import onAuthorize from "../actions/on-authorize";
import onLogin from "../actions/on-login";

const handler = ({
  clientID,
  clientSecret
}: {
  clientID: string,
  clientSecret: string
}): HullHandlersConfiguration => {
  return {
    statuses: { statusHandler },
    incoming: { incomingHandler },
    private_settings: {
      oauth: () => ({
        onAuthorize,
        onLogin,
        onStatus,
        Strategy,
        clientID,
        clientSecret
      })
    }
  };
};

export default handler;
