const sample = require("../../samples/account.json");
const { schemaUrl, searchUrl } = require("../config");
const { post } = require("../lib/request");

const perform = async (z, { inputData }) => {
  const { email, external_id } = inputData;
  const claims = { email, external_id };
  return post(z,{
    url: searchUrl,
    body: { claims, entityType: "account" }
  });
};

const schema = async z =>
  post({ z, url: schemaUrl, body: { entityType: "account" } });

module.exports = {
  key: "account",

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UX.
  noun: "Account",
  display: {
    label: "Find an Account",
    description: "Search for an Account by domain or external_id"
  },

  // `operation` is where we make the call to your API to do the search
  operation: {
    // This search only has one search field. Your searches might have just one, or many
    // search fields.
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

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obviously dummy values that we can show to any user.
    sample,

    // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    // field definitions. The result will be used to augment the sample.
    // outputFields: () => { return []; }
    // Alternatively, a static field definition should be provided, to specify labels for the fields
    // outputFields: () => { return []; }
    outputFields: [schema]
  }
};
