const sample = require("../../samples/account.json");
const { schemaUrl, searchUrl } = require("../config");
const { post } = require("../lib/request");

const perform = async (z, { inputData }) => {
  const { domain, external_id } = inputData;
  const claims = { domain, external_id };
  return post(z,{
    url: searchUrl,
    body: { claims, entityType: "account" }
  });
};

const schema = async z =>
  post(z, {url: schemaUrl, body: { entityType: "account" } });

const account = {
  key: "account",
  noun: "Account",
  display: {
    label: "Find an Account",
    description: "Search for an Account by domain or external_id"
  },
  operation: {
    inputFields: [
      {
        key: "domain",
        type: "string",
        label: "Domain",
        helpText:
          "Domain of the account to lookup. If we find multiple accounts with the same domain, we will use the oldest one."
      },
      {
        key: "external_id",
        type: "string",
        label: "External ID",
        helpText: "External ID of the Account to lookup"
      }
    ],
    perform,
    sample,
    outputFields: [schema]
  }
};

module.exports = {
  account
};
