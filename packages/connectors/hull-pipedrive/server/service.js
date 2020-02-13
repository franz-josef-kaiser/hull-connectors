/* @flow */
import type {
  RawRestApi,
  EndpointType,
  RequestType
} from "hull-connector-framework/src/purplefusion/types";

const {
  ConfigurationError,
  TransientError,
  SkippableError
} = require("hull/src/errors");

const OAuthStrategy = require("passport-oauth2");

const {
  PipedrivePersonWrite,
  PipedrivePersonRead,
  PipedriveOrgWrite,
  PipedriveOrgRead,
  PipedriveAttributeDefinition,
  PipedrivePersonAttributeDefinition
} = require("./service-objects");

const {
  SuperagentApi
} = require("hull-connector-framework/src/purplefusion/superagent-api");
// const MESSAGES = require("./messages");
const { isNull, notNull } = require("hull-connector-framework/src/purplefusion/conditionals");

const service = ({ clientID, clientSecret }: {
  clientID: string,
  clientSecret: string
}): RawRestApi => ({
  initialize: (context, api) => new SuperagentApi(context, api),
  prefix: "https://api-proxy.pipedrive.com",
  endpoints: {
    insertOrg: {
      url: "/organizations",
      operation: "post",
      endpointType: "create",
      returnObj: "body.data",
      input: PipedriveOrgWrite,
      output: PipedriveOrgRead
    },
    updateOrg: {
      url: "/organizations/${accountId}",
      operation: "put",
      endpointType: "update",
      returnObj: "body.data",
      input: PipedriveOrgWrite,
      output: PipedriveOrgRead
    },
    getAllPersons: {
      url: "/persons/",
      operation: "get",
      endpointType: "fetchAll",
      returnObj: "body.data",
      output: PipedrivePersonRead
    },
    getAllPersonsPaged: {
      url: "/persons/",
      operation: "get",
      query: "limit=100&start=${start}",
      endpointType: "fetchAll",
      returnObj: "body",
      output: PipedrivePersonRead
    },
    findPersonByEmail: {
      url: "/persons/find",
      operation: "get",
      endpointType: "byProperty",
      query: "term=${userEmail}&search_by_email=1",
      returnObj: "body.data",
      output: PipedrivePersonRead
    },
    findPersonByName: {
      url: "/persons/find",
      operation: "get",
      endpointType: "byProperty",
      query: "term={personName}",
      returnObj: "body.data",
      output: PipedrivePersonRead
    },
    getPersonById: {
      url: "/persons/${userId}",
      operation: "get",
      endpointType: "byId",
      returnObj: "body.data",
      output: PipedrivePersonRead
    },
    getAllOrgsPaged: {
      url: "/organizations/",
      operation: "get",
      query: "limit=100&start=${start}",
      endpointType: "fetchAll",
      returnObj: "body",
      output: PipedriveOrgRead
    },
    refreshToken: {
      url: "https://oauth.pipedrive.com/oauth/token",
      operation: "post",
      endpointType: "create",
      returnObj: "body",
      settings: [
        { method: "set", params: { "Content-Type": "application/x-www-form-urlencoded" } },
        { method: "set", params: { Authorization: "Basic ${refreshAuthorizationHeader}" } }
      ]
    },
    insertPerson: {
      url: "/persons",
      operation: "post",
      endpointType: "insert",
      returnObj: "body.data",
      input: PipedrivePersonWrite,
      output: PipedrivePersonRead
    },
    updatePerson: {
      url: "/persons/${userId}",
      operation: "put",
      endpointType: "update",
      returnObj: "body.data",
      input: PipedrivePersonWrite,
      output: PipedrivePersonRead
    },
    getOrgFields: {
      url: "/organizationFields",
      operation: "get",
      endpointType: "get",
      returnObj: "body",
      output: PipedriveAttributeDefinition
    },
    getPersonFields: {
      url: "/personFields",
      operation: "get",
      endpointType: "get",
      returnObj: "body",
      output: PipedriveAttributeDefinition
    },
    getAllWebhooks: {
      url: "/webhooks",
      operation: "get",
      endpointType: "fetchAll",
      returnObj: "body.data"
    },
    insertWebhook: {
      url: "/webhooks",
      operation: "post",
      endpointType: "create",
      returnObj: "body",
      settings: [
        { method: "set", params: { "Content-Type": "application/json" } }
      ]
    },
    deleteWebhook: {
      url: "/webhooks/${webhookIdToDelete}",
      operation: "delete",
      endpointType: "delete"
    }
  },
  superagent: {
    settings: [
      { method: "set", params: { "Content-Type": "application/json" }},
      { method: "set", params: { Authorization: "Bearer ${connector.private_settings.access_token}" }}
    ]
  },
  authentication: {
    strategy: "oauth2",
    params: {
      Strategy: OAuthStrategy,
      clientID,
      clientSecret
    }
  },
  error: {
    parser: {

    },
    templates: [
      {
        truthy: { status: 400 },
        errorType: SkippableError,
        message: (error) => {
          return { message: error.error };
        }
      },
      {
        truthy: { status: 401 },
        errorType: ConfigurationError,
        message: "API AccessToken no longer valid, please authenticate with Pipedrive again using the Credentials button on the settings page",
        recoveryroute: "refreshToken"
      }
    ]
  }
});

module.exports = service;
