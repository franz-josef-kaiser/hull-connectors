/* @flow */

const {
  ifL,
  route,
  cond,
  settings,
  set,
  loopL,
  loopEndL,
  Svc,
  hull,
  iterateL,
  cast,
  transformTo,
  settingsUpdate,
  utils,
  ld,
  inc,
  not,
  input,
  notFilter,
  get,
  or,
  cacheLock,
  cacheSet,
  cacheGet,
  filter,
  ex,
  returnValue,
  jsonata
} = require("hull-connector-framework/src/purplefusion/language");
const {
  ZapierUserRead,
  ZapierAccountRead
} = require("./service-objects");

const {
  HullOutgoingAccount,
  HullOutgoingUser,
  WebPayload
} = require("hull-connector-framework/src/purplefusion/hull-service-objects");

const _ = require("lodash");

function zapier(op: string, param?: any): Svc {
  return new Svc({ name: "zapier", op }, param)
}

const glue = {
  userUpdate: [
    iterateL(input(), { key: "message", async: true }, [
      route("userUpdateStart", cast(HullOutgoingUser, "${message}"))
    ])
  ],
  accountUpdate: [
    iterateL(input(), { key: "message", async: true }, [
      route("accountUpdateStart", cast(HullOutgoingAccount, "${message}"))
    ])
  ],
  userUpdateStart: [
    set("zaps", []),
    set("changes", input("changes")),
    set("isNewUser", ld("get", "${changes}", "is_new", false)),
    set("hasUserChanges", cond("lessThan", 0, ld("size", "${changes.user}"))),
    set("hasUserLeftSegmentChanges", cond("lessThan", 0, ld("size", ld("get", "${changes}", "segments.left", [])))),
    set("hasUserEnteredSegmentChanges", cond("lessThan", 0, ld("size", ld("get", "${changes}", "segments.entered", [])))),

    ifL("${isNewUser}", [
      set("zaps", ld("concat", "${zaps}", filter({ entityType: "user", action: "created" }, settings("subscriptions"))))
    ]),
    ifL("${hasUserChanges}", [
      set("zaps", ld("concat", "${zaps}", filter({ entityType: "user", action: "attribute_updated" }, settings("subscriptions"))))
    ]),
    ifL("${hasUserEnteredSegmentChanges}", [
      set("zaps", ld("concat", "${zaps}", filter({ entityType: "user", action: "entered_segment" }, settings("subscriptions"))))
    ]),
    ifL("${hasUserLeftSegmentChanges}", [
      set("zaps", ld("concat", "${zaps}", filter({ entityType: "user", action: "left_segment" }, settings("subscriptions"))))
    ]),

    iterateL("${zaps}", { key: "zap", async: true }, [
      set("zap_url", "${zap.url}"),
      set("resp", zapier("sendZap", input()))
    ])
  ],
  accountUpdateStart: [
    set("zaps", []),
    set("changes", input("changes")),
    set("isNewAccount", ld("get", "${changes}", "is_new", false)),
    set("hasAccountChanges", cond("lessThan", 0, ld("size", "${changes.account}"))),
    set("hasAccountLeftSegmentChanges", cond("lessThan", 0, ld("size", ld("get", "${changes}", "account_segments.left", [])))),
    set("hasAccountEnteredSegmentChanges", cond("lessThan", 0, ld("size", ld("get", "${changes}", "account_segments.entered", [])))),

    ifL("${isNewAccount}", [
      set("zaps", ld("concat", "${zaps}", filter({ entityType: "account", action: "created" }, settings("subscriptions"))))
    ]),
    ifL("${hasAccountChanges}", [
      set("zaps", ld("concat", "${zaps}", filter({ entityType: "account", action: "attribute_updated" }, settings("subscriptions"))))
    ]),
    ifL("${hasAccountEnteredSegmentChanges}", [
      set("zaps", ld("concat", "${zaps}", filter({ entityType: "account", action: "entered_segment" }, settings("subscriptions"))))
    ]),
    ifL("${hasAccountLeftSegmentChanges}", [
      set("zaps", ld("concat", "${zaps}", filter({ entityType: "account", action: "left_segment" }, settings("subscriptions"))))
    ]),

    iterateL("${zaps}", { key: "zap", async: true }, [
      set("zap_url", "${zap.url}"),
      set("resp", zapier("sendZap", input()))
    ])
  ],
  sendZap: [],
  unsubscribeFromError: [
    route("unsubscribe", jsonata(`$.{"body": {"url": url}}`, input("response.req")))
  ],
  credentials: returnValue([
    set("api_key", get("clientCredentialsEncryptedToken", input("context")))
  ], {
    status: 200,
    data: {
      url: "${api_key}"
    }
  }),
  subscriptionRegisteredInHull:
    filter({
        url: input("body.url")
    }, settings("subscriptions")),
  subscribe: returnValue([
    ifL(ld("isEmpty", route("subscriptionRegisteredInHull")), [
      settingsUpdate({
        subscriptions:
          ld("uniqBy", ld("concat", settings("subscriptions"), input("body")), "url")
      })
    ])], {
      data: {
        ok: true
      },
      status: 200
    }
  ),
  unsubscribe: returnValue([
      ifL(not(ld("isEmpty", route("subscriptionRegisteredInHull"))), [
        settingsUpdate({
          subscriptions:
            notFilter({ url: input("body.url") }, settings("subscriptions"))
        })
      ])], {
      data: {
        ok: true
      },
      status: 200
    }
  ),
  create: returnValue([
    set("entityType", input("body.entityType")),

    // TODO move to new transformation when it's ready
    ifL(cond("isEqual", "${entityType}", "account"), [
      hull("asAccount", jsonata(`$.{"ident": {"external_id": claims.external_id, "domain": claims.domain}, "attributes": attributes}`, input("body")))
    ]),
    ifL(cond("isEqual", "${entityType}", "user"), [
      hull("asUser", jsonata(`$.{"ident": {"external_id": claims.external_id, "email": claims.email}, "attributes": attributes}`, input("body")))
    ]),
    ifL(cond("isEqual", "${entityType}", "user_event"), [
      hull("asUser", jsonata(`{"ident":{"external_id": claims.external_id, "email": claims.email},"attributes": attributes, "events": [$merge({"eventName": event_name, "context": {"source": "zapier"}, "properties": properties})]}`, input("body")))
    ])
  ],{
    data: {
      ok: true
    },
    status: 200
  }),
  search: returnValue([
    set("entityType", input("body.entityType")),
    ifL(cond("isEqual", "${entityType}", "account"), {
      do: [],
      eldo: []
    })],{
    data: {
      ok: true
    },
    status: 200
  }),
  schema: returnValue([
    ifL(cond("isEqual", input("body.entityType"), "user_event"), [
      set("rawEntitySchema", hull("getUserEvents")),
      set("entitySchema", jsonata(`[$.{"value": name, "label": name}]`, "${rawEntitySchema}"))
    ]),
    ifL(cond("isEqual", input("body.entityType"), "user"), [
      set("rawEntitySchema", hull("getUserAttributes")),
      set("entitySchema", jsonata(`[$.{"value": $replace(key, "traits_", ""), "label": $replace(key, "traits_", "")}]`, "${rawEntitySchema}"))
    ]),
    ifL(cond("isEqual", input("body.entityType"), "account"), [
      set("rawEntitySchema", hull("getAccountAttributes")),
      set("entitySchema", jsonata(`[$.{"value": $replace(key, "traits_", ""), "label": $replace(key, "traits_", "")}]`, "${rawEntitySchema}"))
    ]),
    ],{
      data: "${entitySchema}",
      status: 200
    }
  ),
  auth: {
    data: {
      ok: true
    },
    status: 200
  },
  segments: returnValue([
      set("entityType", input("body.entityType")),
      ifL(cond("isEqual", input("body.entityType"), "account"), {
        do: [
          set("rawEntitySegments", hull("getAccountSegments"))
        ],
        eldo: [
          set("rawEntitySegments", hull("getUserSegments"))
        ]
      }),
      ifL(cond("notEmpty", "${rawEntitySegments}"), [
        set("entitySegments", jsonata(`[$.{"value": id, "label": name}]`, "${rawEntitySegments}"))
      ])
    ],
    {
      data: "${entitySegments}",
      status: 200
    }
  )
};

module.exports = glue;
