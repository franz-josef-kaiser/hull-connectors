// @flow
/* eslint-disable global-require */
import type { HullHandlersConfiguration, Connector } from "hull";
import { Strategy } from "passport-slack";
import status from "./status";

import fetchAllHandler from "./fetch-all";

import onStatus from "./on-status";
import onAuthorize from "./on-authorize";
// import userUpdate from "./user-update";
// import accountUpdate from "./account-update";
import connectorUpdate from "./connector-update";
import incomingHandler from "./incoming-handler";

const handler = ({
  clientID,
  clientSecret
}: {
  clientID: string,
  clientSecret: string
}) => (_connector: Connector): HullHandlersConfiguration => {
  // const { connectorConfig } = connector;

  return {
    statuses: { status },
    subscriptions: {
      userUpdate: connectorUpdate,
      accountUpdate: connectorUpdate,
      connectorUpdate
    },
    json: {
      fetchAllHandler
    },
    incoming: {
      incomingHandler
    },
    private_settings: {
      oauth: () => ({
        onAuthorize,
        onStatus,
        Strategy,
        clientID,
        clientSecret
      })
    }
  };
};

export default handler;
