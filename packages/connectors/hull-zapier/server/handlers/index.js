// @flow
import type {
  HullExternalResponse,
  HullHandlersConfiguration,
  Connector
} from "hull";

import credentialsHandler from "./credentials-handler";
import statusHandler from "./status-handler";
import subscribeHandler from "./subscribe-handler";
import unsubscribeHandler from "./unsubscribe-handler";
import createHandler from "./create-handler";
import searchHandler from "./search-handler";
import authHandler from "./auth-handler";
import schemaHandler from "./schema-handler";
import segmentsHandler from "./segments-handler";
import userUpdate from "./user-update";
import accountUpdate from "./account-update";

type HandlerType = { flow_size?: number, flow_in?: number };

const handler = ({ flow_size, flow_in }: HandlerType) => (
  _connector: Connector
): HullHandlersConfiguration => {
  return {
    tabs: {
      admin: (): HullExternalResponse => ({ pageLocation: "admin.html" })
    },
    subscriptions: {
      userUpdate: userUpdate({ flow_size, flow_in }),
      accountUpdate: accountUpdate({ flow_size, flow_in })
    },
    statuses: { statusHandler },
    json: {
      credentialsHandler,
      createHandler,
      searchHandler,
      schemaHandler,
      segmentsHandler,
      subscribeHandler,
      unsubscribeHandler,
      authHandler
    }
  };
};

export default handler;
