// @flow
import type {
  HullExternalResponse,
  HullHandlersConfiguration,
  Connector
} from "hull";

import {
  configHandler,
  statusHandler,
  recentHandler,
  previewHandler,
  removeOldEntriesHandler
} from "hull-vm";
import configData from "./config-data";
import scheduledCallHandler from "./scheduledcall-handler";
import apiCall from "./apicall-handler";

const handler = ({ EntryModel }: { EntryModel: any }) => (
  _connector: Connector
): HullHandlersConfiguration => {
  return {
    tabs: {
      admin: (): HullExternalResponse => ({ pageLocation: "admin.html" })
    },
    statuses: {
      statusHandler: statusHandler({
        globals: [
          "variables",
          "body",
          "headers",
          "status",
          "date",
          "url",
          "method",
          "requestHeaders",
          "requestBody"
        ]
      })
    },
    schedules: {
      scheduledCall: scheduledCallHandler(EntryModel),
      removeOldEntriesHandler: removeOldEntriesHandler(EntryModel)
    },
    json: {
      getRecent: recentHandler(EntryModel),
      configHandler: configHandler(configData),
      apiCall: apiCall(EntryModel),
      previewHandler
    }
  };
};

export default handler;
