import _ from "lodash";
import sample from "../../samples/account.json";
import { createUrl } from "../config";
import { post } from "../lib/request";

const perform = async (z, { inputData }) => {
  const { external_id, domain, attributes } = inputData;
  const claims = _.pickBy({ domain, external_id }, (v, _k) => v !== undefined);
  return post({
    z,
    url: createUrl,
    body: { entityType: "account", claims, attributes }
  });
};

const action = {
  key: "account",
  noun: "Account",

  display: {
    // What the user will see in the Zap Editor when selecting an action
    label: "Create or update Account",
    description:
      "Sends Attribute updates to the account identified by a domain. Will create the Account if not created already"
  },

  operation: {
    // Data users will be asked to set in the Zap Editor
    inputFields: [
      { key: "domain", type: "string", label: "Domain", required: false },
      {
        key: "external_id",
        helpText:
          "The external_id of the account to find/create. Takes precedence over the email if present",
        label: "External ID",
        required: false
      },
      { key: "attributes", label: "Attributes to update", required: false }
    ],
    perform,
    // Sample data that the user will see if they skip the test
    // step in the Zap Editor
    sample
  }
};

export default action;
