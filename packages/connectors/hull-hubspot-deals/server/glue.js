/* @flow */

const {
  jsonata,
  route,
  cond,
  hull,
  set,
  utils,
  ifL,
  input,
  Svc,
  cacheSet,
  not,
  cacheGet,
  settingsUpdate,
  settings,
  cacheLock,
  or
} = require("hull-connector-framework/src/purplefusion/language");

function hubspot(op: string, param?: any): Svc {
  return new Svc({ name: "hubspot", op }, param);
}

const dealsAttributes = {
  options: require("./actions/fielddefs/deal-fielddefs")
};

const refreshTokenDataTemplate = {
  refresh_token: "${connector.private_settings.refresh_token}",
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: "",
  grant_type: "refresh_token"
};

const glue = {
  shipUpdate: {},
  isAuthenticated: not(cond("isEmpty", settings("access_token"))),
  isConfigured: cond("allTrue",[
    cond("notEmpty", settings("access_token"))
  ]),
  status: ifL(cond("isEmpty", settings("access_token")), {
    do: {
      status: "setupRequired",
      message: "'Connector has not been authenticated. Please make sure to allow Hull to access your Hubspot data by going to the \"Settings\" tab and clicking \"Login to your Hubspot account\" in the \"Connect to Hubspot\" section'"
    },
    eldo: {
      status: "ok",
      message: "allgood"
    }
  }),
  userUpdate: [
    set("service_name", "hubspot_deal"),
    set("hullUserId", input("user.id")),
    route("upsertDeal")
  ],
  fieldsDealOut:
    ifL(cond("notEmpty",  set("dealProperties", hubspot("getDealProperties"))),
      jsonata("{ \"data\": { \"options\": [properties.{\"label\": label, \"value\": name}]}, \"status\": 200 }", "${dealProperties}")
    ),
  upsertDeal:
    cacheLock(input("user.id"),
      ifL(or([
          set("dealId", input("user.hubspot_deal/id")),
          set("dealId", cacheGet(input("user.id")))
        ]), {
          do: route("updateDeal"),
          eldo: route("insertDeal")
        }
      )
    ),

  updateDeal:
    ifL(cond("notEmpty", set("dealFromHubspot", hubspot("updateDeal", input()))),[
      ifL(set("companyId", input("user.${connector.private_settings.outgoing_user_associated_account_id}")),
        hubspot("updateDealCompanyAssociation", {
          fromObjectId: "${dealId}",
          toObjectId: "${companyId}",
          category: "HUBSPOT_DEFINED",
          definitionId: 5
        })
      ),
      hull("asUser", "${dealFromHubspot}")
    ]),

  insertDeal:
    ifL(cond("notEmpty", set("dealFromHubspot", hubspot("insertDeal", input()))), [
      cacheSet({ key: input("user.id") }, "${dealFromHubspot.data.dealId}"),
      hull("asUser", "${dealFromHubspot}")
    ]),

  refreshToken:
    ifL(cond("notEmpty", "${connector.private_settings.refresh_token}"), [
      set("connectorHostname", utils("getConnectorHostname")),
      ifL(cond("notEmpty", set("refreshTokenResponse", hubspot("refreshToken", refreshTokenDataTemplate))),
        settingsUpdate({
          expires_in: "${refreshTokenResponse.expires_in}",
          created_at: "${refreshTokenResponse.created_at}",
          refresh_token: "${refreshTokenResponse.refresh_token}",
          access_token: "${refreshTokenResponse.access_token}"
        })
      )
    ])
};

module.exports = glue;
