//@flow
import { notificationHandler } from "hull/src/handlers";

import type { Connector } from "hull";
export default function Routes(connector: Connector) {
  const { app, server, connectorConfig, Client } = connector;
  const { hostSecret } = connectorConfig;

}
