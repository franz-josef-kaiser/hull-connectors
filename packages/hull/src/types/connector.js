// @flow

import type { HullManifest, HullConnectorSettings } from "./index";
// =====================================
// Hull Connector Data Object
// =====================================

export type HullConnector = {
  id: string,
  updated_at: string,
  created_at: string,
  name: string,
  description: string,
  tags: Array<string>,
  source_url: string,
  index: string,
  picture: string,
  homepage_url: string,
  manifest_url: string,
  manifest: HullManifest,
  settings: HullConnectorSettings,
  private_settings: HullConnectorSettings,
  status: Object
};

// =====================================
//   Connector Configuration
// =====================================

export type HullJsonConfig = {
  inflate?: boolean,
  reviver?: Function,
  limit?: string,
  strict?: boolean,
  type?: string | Function,
  verify?: Function
};
export type HullHTTPClientConfig = {
  timeout?:
    | number
    | {
        deadline: number,
        response: number
      },
  retries?: number,
  prefix?: string,
  throttle?:
    | false
    | {
        rate?: number,
        ratePer?: number,
        concurrent?: number
      }
};
export type HullServerConfig = {
  start?: boolean
};
export type HullWorkerConfig = {
  start?: boolean,
  queueName?: string
};

export type HullMetric =
  | ["value", string, number, Array<string>]
  | ["increment", string, number, Array<string>];

export type HullMetricsConfig = {
  captureMetrics?: Array<HullMetric>,
  exitOnError?: boolean
};
export type HullLogsConfig = {
  logLevel?: ?string
};
export type HullCacheConfig =
  | {
      store: "memory",
      isCacheableValue?: () => boolean,
      ttl?: number | string,
      max?: number | string,
      min?: number | string
    }
  | {
      store: "redis",
      isCacheableValue?: () => boolean,
      url: string,
      ttl?: number | string,
      max?: number | string,
      min?: number | stringr
    };
export type HullClientCredentials = {
  id: string,
  secret: string,
  organization: string
};
export type HullConnectorConfig = {
  clientConfig: HullClientConfig,
  serverConfig?: HullServerConfig,
  workerConfig?: HullWorkerConfig,
  metricsConfig?: HullMetricsConfig,
  cacheConfig?: HullCacheConfig,
  httpClientConfig?: HullHTTPClientConfig,
  logsConfig?: HullLogsConfig,
  jsonConfig?: HullJsonConfig,
  hostSecret: string,
  port: number | string,
  connectorName?: string,
  segmentFilterSetting?: any,
  skipSignatureValidation?: boolean,
  timeout?: number | string,
  disableOnExit?: boolean,
  devMode?: boolean,
  instrumentation?: Instrumentation,
  queue?: void | Queue,
  handlers:
    | HullHandlersConfiguration
    | (HullConnector => HullHandlersConfiguration),
  notificationValidatorHttpClient?: Object,
  middlewares: Array<Middleware>,
  manifest: HullManifest
  // $FlowFixMe
  // handlers: HullHandlers // eslint-disable-line no-use-before-define
};