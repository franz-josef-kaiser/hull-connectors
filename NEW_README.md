## Live Debugging

- Add `debugger` statements to your server code
- Install https://chrome.google.com/webstore/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj
- Click the extension icon, switch to `auto`

> Chrome Dev Tools will attach to your node server app and let you debug - 1000% time saved.

You're welcome

## Ngrok

```
$ yarn ngrok hull-incoming-webhooks

ngrok by @inconshreveable

Session Status                online
Account                       Hull Dev Team (Plan: Basic)
Version                       2.3.25
Region                        Europe (eu)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://hull-incoming-webhooks.eu.ngrok.io -> http://localhost:8082
Forwarding                    https://hull-incoming-webhooks.eu.ngrok.io -> http://localhost:8082
```

### Run specified tests

`yarn run-test path_to_test_file(s)`

## Client-side code bundles

Any code in the `src` folder of a connector will be built

- all root level .js will be compiled.
- all root-level .scss will be compiled

Those will be available at the root of the connector when deployed:

`/src/index.js` -> `https://connector.com/admin.js`

Hot Reload is included.

## Enabling Debug messages

Start the connector with the following syntax:

```
$ DEBUG=hull* yarn dev hull-incoming-webhooks
```

- Boots connector with the `debug` library started with `DEBUG=hull*` so you can see all of Hull's debugging stack
- Hull will always scope debug messages with the `hull` prefix

## Data Typing

### Function Parameters

We love and embrace `flow`. We strive to have a uniform signature for all handlers:
The first argument is always a `HullContext` object.
The second argument varies depending on the Handler:

- HullIncomingHandlerMessage for `html`, `incoming`, `JSON`, `status` handlers
- HullUserUpdateMessage for `user:update` Kraken Notifications
- HullAAccountUpdateMessage for `account:udpate` Kraken Notifications

### Function Responses

We also strive to have a uniform and typed response so functions can be as pure as possible, and simply return data whenever possible.

- All methods MUST be `async`
- The returned data must conform to one of the following types. Check `packages/hull/src/types/response.js`
  - `HullStatusResponse` for status responses back to the platform.
  - `HullExternalResponse` for anything that returns data to the outside.
  - `HullCredentialsResponse` for handlers that display generated tokens and URLS showin in the Settings
  - `HullUISelectResponse` for handlers that return the content of a Select field in the settings
  - `HullNotificationResponse` for Kraken notifications,

```js
// Kraken Response for subscription handlers
type HullNotificationResponse = {
  flow_control?: {
    type: "next" | "retry",
    size?: number,
    in?: number,
    in_time?: number
  }
};

// json, html and incoming handlers (except if `fireAndForget=true` in handler options in manifest)
type HullExternalResponseData = void | {
  status?: number, //HTTP StatusCode
  pageLocation?: string,
  error?: string, //Optional error. takes precedence. sent as { error: error }
  data?: any, //JSON Response,
  text?: string //Fallback Text response. Ignored if `data` is set
};

// For `Status` handlers
type HullStatusResponse = {
  status: "ok" | "warning" | "error" | "setupRequired", //Conector Status
  messages: string | Array<string> //Message or array of messages to display in dashboard
};

// For `json` handlers that display a Select in the dashboard
type HullUISelect = { label: string, value: string | number };
type HullUISelectGroup = {
  label: string,
  options: Array<HullUISelectGroup> | Array<HullUISelect>
};
type HullUISelectResponse = {
  status?: number,
  data: {
    options: Array<HullUISelect> | Array<HullUISelectGroup>
  }
};

// For text fields that return a computed string that the dashboard should show, I.e. to expose a token or an URL
type HullCredentialsResponse = {
  status: number,
  data: {
    url: string
  }
};
```

Example Usage:

```js
// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullExternalResponse
} from "hull";

export default async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
) => HullExternalResponse {
  try {
    const data = await processData(message);
    return {
      status: 200,
      data,
      // text: "foo",
      // pageLocation: "bar.html" -> renders this template with `data` passed to it if defined
    };
  } catch (err) {
    return {
      status: 500,
      error: err.toString()
    }
  }
}

```

For Notifications and Batches:

```js
// @flow
import type { HullContext, HullUserUpdateMessage } from "hull";
export default async (
  ctx: HullContext,
  messages: Array<HullUserUpdateMessage>
): HullNotificationResponse => {
  try {
    const response = await processData(messages);
    return {
      flow_control: {
        type: "next",
        size: 10,
        in: 10,
        in_time: 10
      }
    };
  } catch (err) {
    return {
      flow_control: { type: "retry" }
    };
  }
};
```

checkout `types.js` for the exact format of requests and replies

## HullConnectorConfig

The main way to configure a connector, an object returned by `/config.js`
Uses a strict Flow type of `HullConnectorConfig` - check `/packages/hull/types/connector.js` to get all the details;

```js
// @flow

import type { HullConnectorConfig } from "hull";
import manifest from "../manifest.json";
import fetchToken from "./lib/fetch-token";
import handlers from "./handlers";

export default function connectorConfig(): HullConnectorConfig {
  const {
    LOG_LEVEL,
    SECRET,
    NODE_ENV,
    PORT = 8082,
    OVERRIDE_FIREHOSE_URL
  } = process.env;

  const hostSecret = SECRET || "1234";

  return {
    manifest,
    hostSecret,
    devMode: NODE_ENV === "development",
    port: PORT || 8082,
    handlers: async (connectorInstance: HullConnector) => ({
      json: { ...json handlers },
      incoming: { ...incoming handlers },
      html: { ...html handlers },
      statuses: { ...statuses handlers },
      subscriptions: { ...subscriptions handlers },
    }),
    middlewares: [fetchToken],
    cacheConfig: { store: "memory", ttl: 1 },
    logsConfig: { logLevel: LOG_LEVEL },
    clientConfig: { firehoseUrl: OVERRIDE_FIREHOSE_URL },
    serverConfig: { start: true }
  };
}
```

```js
export type HullConnectorConfig = {
  clientConfig: HullClientConfig,
  serverConfig?: HullServerConfig, //How to start the express server
  workerConfig?: HullWorkerConfig, //How to start workers
  metricsConfig?: HullMetricsConfig, //Metrics reporting configuration
  cacheConfig?: HullCacheConfig, //Cache configuration
  httpClientConfig?: HullHTTPClientConfig, //HTTP Client util configuration
  logsConfig?: HullLogsConfig, //Logs configuration
  jsonConfig?: HullJsonConfig, //JSON parsing configuration
  hostSecret: string, //connector secret
  port: number | string, //connector port
  connectorName?: string, //connector name
  timeout?: number | string, //Connector timeout settings. Default = 25s
  disableOnExit?: boolean, //Should we disable exit listeners. Default = false
  devMode?: boolean, //development mode
  instrumentation?: HullInstrumentation, // set a custom instrumentation instance
  queue?: void | HullQueue, // set a Custom Queue instance for workers
  handlers: HullConnector => HullHandlersConfiguration, //Handlers methods
  middlewares: Array<Middleware>, //Array of middlewares to run before handlers
  manifest: HullManifest // the current manifest
};
```

We recommend to boot the connector like this:

```js
// @flow
import Hull from "hull";
import config from "./config";
new Hull.Connector(config).start();
```

## Manifest

Each of the following Keys can accept standard options:

- json
- html / tabs
- incoming
- schedules
- statuses

They all accept the common pattern. Sane defaults are applied to each handler type, you can override them by setting the relevant options

```js
{
  json: [
    {
      url: string, // "/some_url",
      handler: string, // "myJsonHandler",
      method?: "post" | "get" | "put" | "all",
      options: {
        bodyParser?: "urlencoded" | "json",
        credentialsFromQuery?: boolean,
        credentialsFromNotification?: boolean,
        cache?: {
          key: string,
          secret: Object
        },
        dropIfConnectorDisabled?: boolean,
        respondWithError?: boolean,
        cacheContextFetch?: boolean,
        disableErrorHandling?: boolean,
        fireAndForget?: boolean,
        strict?: boolean,
        format?: "json" | "html"
      }
    }
  ]
}
```

The `handler` key from the manifest defines which function to use to respond on this url. in `config.js` -> `HullConnectorConfig.handler`:

## Hull-managed HTTP Client.

The Hull-managed HTTP Client is based on the latest superagent with some added plugins. It handles the following for you:

- Promise Interface
- Full instrumentation for Logging & metrics
- Throttling (defaults set through ConnectorConfig)
- Retries (defaults set through ConnectorConfig)
- Timeouts (timeout defaults set through ConnectorConfig)
- prefixes (defaults set through ConnectorConfig)

Checkout [./packages/hull/src/types.js#251](HullHTTPClientConfig)
More docs here: https://visionmedia.github.io/superagent/#agents-for-global-state

```js
const connectorConfig = {
  ...
  httpClientConfig = {
    timeout: {
      response: 5000,  // Wait 5 seconds for the server to start sending,
      deadline: 60000, // but allow 1 minute for the file to finish loading.
    },
    /* timeout: 60000, */ Alternative syntax to only use `deadline`
    prefix: "/foo",
    retries: 2 //Be careful when setting retries for the entire agent: you don't want to auto-retry requests that aren't idempotent. A better implementation is to call `.retries(n)` in each call.
    throttle: {
      rate: 1,
      ratePer: 2,
      concurrent: 2
    }
  }
}
function(ctx, messages){
  const { request } = ctx;
  //Instance of SuperAgent
  const response = await request
    .get("https://example.com/foo")
    .set("accept", "json")
    .set(`Authorization: Bearer ${api_key}`));
}
```

## Hull Client retries & timeouts.

Moved timeout & retry to `HullClientConfig`:
Checkout [./packages/hull-client/src/typesjs#239](HullClientConfig);

```js
const connectorSettings = {
  ...
  clientConfig: {
    ...
    timeout: 3000 //3s - previously configured with process.env.BATCH_TIMEOUT
    retry: 3000 //3s - previously configured with process.env.BATCH_RETRY
  }
}
```

## aes-Encrypted Tokens

the library now exposes and parses an additional, aes-encrypted token.
In addition to the jwt-signed `clientCredentialsToken`, you can now use `clientCredentialsEncryptedToken` which is aes-encrypted - useful when you don't want the secret to leak out...

The token will be encrypted and decrypted with the `hostSecret` you passed in the `HullConnectorConfig`.

```js
function userUpdate(ctx, messages) {
  ctx.clientCredentialsEncryptedToken; // aes-encrypted token.
}
```

To generate a client from this token, you can pass the it in the querystring as `hullToken`, `token` or `state` - any of those three values will be tried for a token if we didn't find anything else anywhere. No middleware required.

```
  https://my-connector.dev?token=AES_ENCRYPTED_TOKEN
  https://my-connector.dev?hullToken=AES_ENCRYPTED_TOKEN
  https://my-connector.dev?state=AES_ENCRYPTED_TOKEN
  -> Hull will auto-parse this token to generate an Environment.
```

If you need to pass this token another way, you can add a middleware to your `connectorConfig` that will fetch the token from where you stored it and pass it in `req.hull.clientCredentialsToken`

Here's a full example of a handler parsing things the right way:

```js
/* @flow */
import type { NextFunction } from "express";
import type { HullRequest, HullResponse } from "hull";

export default function fetchToken(
  req: HullRequest,
  res: HullResponse,
  next: NextFunction
) {
  if (req.query.conf) {
    req.hull = req.hull || {};
    req.hull.clientCredentialsEncryptedToken = req.query.conf.toString();
  }
  next();
}

const config: HullConnectorConfig = {
  ...
  hostSecret: "ABCD",
  middlewares: [fetchToken],
  ...
}
Hull.Connector(config).start();
```

This will make sure the token is in the right place for the rest of the stack to parse and create the right config.

_NOTE: This also parses JWT tokens with the same logic. We just try to decode both formats_

# OAuth authorization

The OAuth Handler has been rewritten.
It is now stricter and requires less configuration.
The `Status` endpoint is configured to be `${URL}/status` -> here below it would be `/auth/status`
Here's how you use it:

### Manifest

```json
{
  "private_settings": [
    {
      "name": "oauth",
      "title": "Credentials",
      "description": "Authenticate with Hubspot",
      "format": "oauth",
      "type": "string",
      "handler": "oauth",
      "url": "/auth",
      "options": {
        "name": "Hubspot",
        "strategy": {
          "scope": ["oauth", "contacts", "timeline", "content"]
        }
      }
    }
  ]
}
```

### Code

```js
/* @flow */
import type {
  HullContext,
  HullExternalResponse,
  HullIncomingHandlerMessage,
  HullOAuthHandlerParams,
  HullOauthAuthorizeMessage,
  HullOAuthAuthorizeResponse
} from "hull";
import { Strategy } from "passport-slack";

async function onStatus(
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): HullExternalResponse {
  const { connector, client } = ctx;
  const { query = {} } = message;
  //Logic to define if connector is properly setup here.
  //...
  //return the data you wish to pass to the page, and a redirect code.
  if (connector_is_setup) {
    return {
      status: 200,
      data: { message: "Connected", html: "<p>Connected</p>" }
    };
  } else {
    return { status: 400, data: { message: "Error", html: "<p>Error</p>" } };
  }
}

async function onAuthorize(
  ctx: HullContext,
  message: HullOauthAuthorizeMessage
): HullOAuthAuthorizeResponse {
  //actions to perform when receiving auth code. Will be present in message.account.
  //message contains all the interesting components of a HTTP request: See HullIncomingHandlerMessage
  const { body, ip, url, method, query, params, path, account } = message;
  const { accessToken, params } = account;
  const { ok, bot = {}, team_id, user_id, incoming_webhook = {} } = params;
  //Your logic to extract data from the Oauth response
  //Reply with a set of updated connector settings - will be saved before redirecting.
  return {
    private_settings: {
      accessToken
    }
  };
}
async function onLogin(ctx: HullContext, message: HullIncomingHandlerMessage) {
  // Logic to perform on Login
  // Best used to process form parameters, to be submitted to the Login sequence. Useful to add strategy-specific parameters, such as a portal ID for Hubspot for instance.
  return {
    // any data object that you want to pass to the passport.authorize method:
    // http://www.passportjs.org/docs/authorize/
    // passport.authorize(AUTH URL, { parameters })
    // callback URL is passed automatically, and `state`
  };
}

const connectorConfig: HullConnectorConfig = {
  // ...
  handlers: {
    private_settings: {
      oauth: () => ({
        onAuthorize, // collect the response from authorization and return a new `private_settings` with the token in it.
        onLogin, //returns data that should be passed on Login.
        onStatus, //handler that checks if tokens are properly saved and returns an oauth-specific status and user-displayed content in the Settings tab
        Strategy, //pass passport Strategy. We rely on Passport to handle it all
        clientID, //pass client id -> recommendation is to pass it to the handlers() method
        clientSecret //pass client secret -> recommendation is to pass it to the handlers() method
      })
    }
  }
};

Hull.Connector(connectorConfig).start();
```

# Caching

A cache mechanism is available for use in the connector.
Here's it's signature:

```js
const { cache } = ctx;

await cache.get("object_name");
await cache.set("object_name", object_value);
const object_value = await cache.wrap("object_name", () => getData());
```

_Note_: You can't use the following Cache Keys, they are reserved:

- any Connector ID,
- `segments`,
- `account_segments`,

By default, the cache uses a Memory store. If you want to use persistence, or share it across instances, create a persistence layer such as Redis by passing the following as part of the HullConnectorConfig object at boot. We support "redis" and "memory" caches

```js
const connectorConfig: HullConnectorConfig = {
  ...
  cache: {
    store: "redis",
    url: CACHE_REDIS_URL,
    ttl: SHIP_CACHE_TTL,
    max: CACHE_REDIS_MAX_CONNECTIONS,
    min: CACHE_REDIS_MIN_CONNECTIONS
  }
  ...
}
```

Defaults:

- ttl = 60 seconds,
- max: 100 Items
- store: "memory"

# Connector Status checks

By describing a `statuses` block in the manifest, you can have a strictly verified status endpoint:

```
"statuses": [
  {
    "url": "/status",
    "handler": "statusHandler",
    "type": "interval",
    "value": "5"
  }
],
```

```js
import type { HullStatusResponse, HullContext } from "hull";
handlers = {
  ...
  statuses: {
    statusHandler: async (ctx: HullContext): HullStatusResponse => {
      return {
        status: "ok" | "error" | "warning" | "setupRequired",
        messages: ["string", "string"]
      }
    }
  }
}
```

The connector will take care of updating the status in the platform for you

# Updating Settings

From now on you can specify whether or not you want the platform to perform a **synchronous status check** after updating the settings.

This can be achieved by adding an extra parameter in a `settingsUpdate` call.

```js
const { hull: ctx } = req;
const authResponse = onAuthorize(ctx, message);
const { private_settings } = authResponse || {}; //  |
//  |
if (private_settings) {
  //  v
  ctx.helpers.settingsUpdate(private_settings, true);
}
```

# View Partials

In views (if you still use them), you can refer to partials in `ejs`:

```
<%- include ../../../assets/partials/hull-logo %>
```

# Hull Virtual Machine package

This package embeds the common code for all connectors that run User-defined code.
It gives you a set of methods and classes to abstract the common behaviours. Try to move as much code as possible there when evolving the VM connectors.

Calling the `server` method Starts an express server and returns an object containing:

```js
{
  app; //The Express server, a simple const app=express();
  server; //The instantiated express server, listening on the port defined by connectorConfig.port
  connector; //an instannce of new Hull.Connector()
}
```

Here's a minimal setup:

```js
// @flow
import Hull from "hull";
import type { HullConnectorConfig } from "../../../types";
import manifest from "../manifest.json";
import server from "../../../server"; //The standard server require
import configure from "./server"; //The connector's custom setup

const {
  SECRET = "1234",
  NODE_ENV,
  OVERRIDE_FIREHOSE_URL,
  LOG_LEVEL,
  REDIS_URL,
  PORT
} = process.env;

const connectorConfig: HullConnectorConfig = {
  manifest,
  devMode: NODE_ENV === "development",
  logLevel: LOG_LEVEL,
  hostSecret: SECRET || "1234",
  port: PORT || 8082,
  handlers: {},
  middlewares: [],
  clientConfig: {
    firehoseUrl: OVERRIDE_FIREHOSE_URL
  }
};

const { app, server, connector } = server({ Hull, connectorConfig }

configure({ app, server, connector }));

```

## Hull-VM call deduplication

We're using "immutable" (https://immutable-js.github.io/immutable-js/) to perform value-comparision of the claims that are passed in order to properly and reliably deduplicate calls.
We're also comparing the data from the payload with the returned data to eliminate the idempotent value updates connector-side.

Here are a few examples:

```js
const asUser = hull.asUser({ email: "bar@baz.co" });
const asUser3 = hull.asUser({ email: "bar@baz.co" });

asUser.alias({ anonymous_id: "1234" });
asUser.unalias({ anonymous_id: "1234" });

asUser3.alias({ anonymous_id: "1234" });
asUser3.unalias({ anonymous_id: "1234" });

// => hull.asUser({"email":"bar@baz.co"}).unalias({"anonymous_id":"1234"});

asUser3.traits({ foo: "bar" });
asUser.traits({ foo: "barz", baz: "boo" });
hull.asUser({ email: "bar@baz.co" }).identify({ foo: "bazinga" });
// => hull.asUser({"email":"bar@baz.co"}).traits({"foo":"bazinga","baz":"boo"});
```

# Fetching Entities

These methods help you fetch data from the Hull API and rebuild a format that is mosly similar to a Kraken Notification.
Some data types from event properties can't be reliably mapped back at the moment, but the raw data will be present.

```js
const email_fetch = {
  claims: { email: "foo@bar.com" }
};
const external_id_fetch = {
  claims: { external_id: "sldjfal;dk" }
};
const anonymous_id_fetch = {
  claims: { anonymous_id: "123890423984" }
};
const intercom_fetch = {
  claims: { anonymous_id: "intercom: 1245" }
};

const eventSchema = await ctx.entities.events.getSchema();
const userSchema = await ctx.entities.users.getSchema();
const accountSchema = await ctx.entities.accounts.getSchema();

const data = await ctx.entities.users.get({
  claims: { email: "foo@bar.com" }
  include: {
    events: {
      names: ["Segmentd Changed"],
      limit: 100,
      page: 1
    },
  , account: false
  }
});
// Response =>
{
  user,
  events, //only if events included
  account, //except if include.account===false
  segments,
  segment_ids,
  account_segments,
  account_segment_ids,
}
const data = await ctx.entities.events.get({
  claims: { email: "foo@bar.com" }
  include: {
    events: {
      parent: '123142' //mandatory if if you're accessing events directly
      names: ["Segmentd Changed"],
      limit: 100,
      page: 1
    },
    account: false
  } //Fetch only "Segment Changes" events. Max Limit: 100
});
// Response =>
{
    "event": "Updated email address",
    "created_at": "2019-03-15T09:48:15Z",
    "properties": {
      "email": "romain@hull.io",
      "topic": "contact.added_email",
      "event": "Updated email address"
    },
    "event_source": "intercom",
    "event_type": "track",
    "context": {
      "useragent": "Hull Node Client version: 2.0.0-beta.1",
      "device": {
        "name": "Other"
      },
      "referrer": {},
      "os": {
        "name": "Other"
      },
      "browser": {
        "name": "Other"
      },
      "location": {
        "country": "US",
        "city": "Mountain View",
        "timezone": "America/Los_Angeles",
        "region": "CA",
        "countryname": "United States",
        "regionname": "California",
        "zipcode": "94035"
      },
      "campaign": {},
      "ip": "216.239.36.21",
      "page": {}
    }
  }

const data = await ctx.entities.accounts.get({
  claims: { domain: "foo.com" }
  include: {} //Nothing supported for now
});

```

## Hull REPL

The connectors can be started in "command line" mode, where you will be able to emit calls to the API, and send them some data.

```
yarn repl hull-processor --id=CONNECTOR_ID --secret=CONNECTOR_SECRET --organization=ORGANIZATION
```

Then, once boot is complete:

```
hull > ctx.client.get("app")
```

## Import util

In authorized repl you can execute following line to generate 10 faked users with name and email:

```
hull > fakeUsers("name_of_the_file.json", 10)
```

Then import it to the organization of the ship:

```
hull > importFile("name_of_the_file.json")
```

## `ctx`

Hull Context object (see docs)

## `utils`

Hull Utils object

## `updatePrivateSettings` helper to update settings for this connector instance. use like this:

```js
updatePrivateSettings({ foo: "bar" });
```

## utilities libs

- moment: `moment`
- lodash: `lo`
- shelljs: `shell`
- parse: `parse`
- highland: `highland`
- sourceUrl: Connector's source URL

## superagent: `agent`

use like this:

```
agent.get("/some_connector_url") -> credentials will be added for you
```

## fakeUsers

## fakeAccounts

## importFile

```

```
