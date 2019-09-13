// @flow
import type {
  HullExternalResponse,
  HullHandlersConfiguration,
  Connector
} from "hull";

import credentialsHandler from "./credentials-handler";
import entityHandler from "./entity-handler";

const handler = () => (_connector: Connector): HullHandlersConfiguration => {
  return {
    tabs: {
      admin: (): HullExternalResponse => ({ pageLocation: "admin.html" })
    },
    schedules: {},
    statuses: {},
    subscriptions: {},
    json: {
      credentialsHandler,
      entityHandler
    }
  };
};

export default handler;
