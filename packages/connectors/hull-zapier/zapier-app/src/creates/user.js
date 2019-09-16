import _ from "lodash";
import sample from "../../samples/user.json";
import { createUrl } from "../config";
import { post } from "../lib/request";

const perform = async (z, { inputData }) => {
  const { external_id, email, attributes } = inputData;
  const claims = _.pickBy({ email, external_id }, (v, _k) => v !== undefined);
  return post({
    z,
    url: createUrl,
    body: { entityType: "user", claims, attributes }
  });
};

const action = {
  key: "user",
  noun: "User",

  display: {
    // What the user will see in the Zap Editor when selecting an action
    label: "Create or update User",
    description:
      "Sends Attribute updates to the user identified by an email. Will create the User if not created already"
  },

  operation: {
    // Data users will be asked to set in the Zap Editor
    inputFields: [
      { key: "email", type: "string", label: "Email", required: false },
      {
        key: "external_id",
        helpText:
          "The external_id of the user to find/create. Takes precedence over the email if present",
        label: "External ID",
        required: false
      },
      {
        key: "attributes",
        dict: true,
        label: "Attributes to update",
        required: false
      }
    ],
    perform,
    // Sample data that the user will see if they skip the test
    // step in the Zap Editor
    sample
  }
};

export default action;
