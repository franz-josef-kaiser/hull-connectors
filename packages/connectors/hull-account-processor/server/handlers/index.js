// @flow
import type {
  HullExternalResponse,
  HullHandlersConfiguration,
  Connector
} from "hull";

import {
  entityHandler,
  configHandler,
  statusHandler,
  previewHandler
} from "hull-vm";
import configData from "./config-data";
import accountUpdate from "./account-update";

const handler = ({
  flow_size,
  flow_in
}: {
  flow_size: number | string,
  flow_in: number | string
}) => (_connector: Connector): HullHandlersConfiguration => {
  return {
    tabs: {
      admin: (): HullExternalResponse => ({ pageLocation: "admin.html" })
    },
    subscriptions: {
      accountUpdate: accountUpdate({ flow_size, flow_in })
    },
    statuses: { statusHandler },
    json: {
      configHandler: configHandler(configData),
      entityHandler,
      previewHandler
    }
  };
};

export default handler;
