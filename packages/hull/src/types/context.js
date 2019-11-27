// @flow

import type { agent } from "superagent";
import type {
  HullGetEntityParams,
  HullIncludedEvents,
  HullEntityName,
  HullFetchedEvent,
  HullGetUserResponse,
  HullGetAccountResponse,
  HullAttributeSchemaEntry,
  HullEventSchemaEntry,
  HullClientCredentials,
  HullUserSegment,
  HullAccountSegment,
  HullConnector,
  HullConnectorConfig,
  HullClientConfig,
  HullNotification,
  HullCredentialsObject,
  HullClient
} from "./index";

import {
  incomingClaims,
  settingsUpdate,
  encrypt,
  decrypt,
  extractRequest,
  mappingToOptions,
  mapAttributes,
  operations
} from "../helpers";

const ConnectorCache = require("../infra/cache/connector-cache");
const MetricAgent = require("../infra/instrumentation/metric-agent");

// =====================================
//   Hull Context
// =====================================

export type HullContextBase = {|
  requestId?: string, // request id
  hostname: string, // req.hostname
  options: Object, // req.query
  isBatch: boolean,
  HullClient: Class<HullClient>,

  connectorConfig: HullConnectorConfig, // configuration passed to Hull.Connector
  clientConfig: HullClientConfig, // configuration which will be applied to Hull Client

  cache: ConnectorCache,
  metric: MetricAgent,
  enqueue: (
    // queueAdapter: Object,
    // // eslint-disable-next-line no-use-before-define
    // ctx: HullContext,
    jobName: string,
    jobPayload?: Object,
    options?: Object
  ) => Promise<*>,
  ...HullCredentialsObject
|};
export type HullContext = {|
  /**
   * Context added to the express app request by hull-node connector sdk.
   * Accessible via `req.hull` param.
   * @public
   * @memberof Types
   */
  ...HullContextBase,
  metric: MetricAgent,
  hostname: string, // req.hostname
  handlerName?: string,
  clientCredentials: HullClientCredentials, // HullClient configuration
  // clientCredentialsToken?: string,
  clientCredentialsToken: string,
  clientCredentialsEncryptedToken: string,
  // connector?: HullConnector,
  connector: HullConnector,
  // usersSegments?: Array<HullSegment>,
  // accountsSegments?: Array<HullSegment>
  usersSegments: Array<HullUserSegment>,
  accountsSegments: Array<HullAccountSegment>,
  client: HullClient,
  notification?: HullNotification,
  connector: HullConnector,
  authParams?: {},
  // @TODO => refine Superagent signature
  request: agent,
  entities: {
    get: HullGetEntityParams => Promise<
      HullGetUserResponse | HullGetAccountResponse
    >,
    getSchema: HullEntityName => Promise<Array<HullEventSchemaEntry>>,
    events: {
      get: HullIncludedEvents => Promise<Array<HullFetchedEvent>>,
      getSchema: () => Promise<Array<HullEventSchemaEntry>>
    },
    users: {
      get: HullGetEntityParams => Promise<HullGetUserResponse>,
      getSchema: () => Promise<Array<HullAttributeSchemaEntry>>
    },
    accounts: {
      get: HullGetEntityParams => Promise<HullGetAccountResponse>,
      getSchema: () => Promise<Array<HullAttributeSchemaEntry>>
    }
  },
  helpers: {
    encrypt: $Call<typeof encrypt, HullContext>,
    decrypt: $Call<typeof decrypt, HullContext>,
    settingsUpdate: $Call<typeof settingsUpdate, HullContext>,
    incomingClaims: $Call<typeof incomingClaims, HullContext>,
    extractRequest: $Call<typeof extractRequest, HullContext>,
    mappingToOptions: $Call<typeof mappingToOptions, HullContext>,
    mapAttributes: $Call<typeof mapAttributes, HullContext>,
    operations: $Call<typeof operations, HullContext>
  }
|};
