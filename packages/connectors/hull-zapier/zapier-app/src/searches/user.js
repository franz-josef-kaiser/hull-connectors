import sample from "../../samples/user.json";
import { schemaUrl, searchUrl } from "../config";
import { post } from "../lib/request";

const perform = async (z, { inputData }) => {
  const { email, external_id } = inputData;
  const claims = { email, external_id };
  return post(z,{
    url: searchUrl,
    body: { claims, entityType: "user" }
  });
};

const schema = async z =>
  post(z, { url: schemaUrl, body: { entityType: "account" } });

const user = {
  key: "user",
  noun: "User",
  display: {
    label: "Find a User",
    description: "Search for a User by email or external_id"
  },
  operation: {
    inputFields: [
      {
        key: "email",
        type: "string",
        label: "Email",
        helpText:
          "Email of the User to lookup. If we find multiple emails, we will use the oldest entry"
      },
      {
        key: "external_id",
        type: "string",
        label: "External ID",
        helpText: "External ID of the user to look up"
      }
    ],
    perform,
    sample,
    outputFields: [schema]
  }
};

module.exports = {
  user
};
