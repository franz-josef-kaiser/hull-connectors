// @flow

import type { $Application, Router } from "express";
import type {
  HullConnectorConfig,
  HullCache,
  HullQueue,
  HullInstrumentation,
  HTTPMethod
} from "./index";

type ExpressMethod = "use" | HTTPMethod;

// =====================================
//   Middleware params types
// =====================================
export type HullBaseMiddlewareParams = {
  Client: Class<Client>,
  queue: HullQueue,
  cache: HullCache,
  instrumentation: HullInstrumentation,
  connectorConfig: HullConnectorConfig
};

export type HullRouteMap = {
  router: Router,
  method: ExpressMethod
};

export type HullServerFunction = (
  app: $Application,
  extra?: Object
) => $Application;

export type HullRouterFactory = any => void | HullRouteMap;