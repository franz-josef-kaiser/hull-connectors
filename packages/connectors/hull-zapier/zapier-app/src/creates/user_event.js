import _ from "lodash";
import sample from "../../samples/user_event.json";
import { createUrl } from "../config";
import { post } from "../lib/request";

const perform = async (z, { inputData }) => {
  const { external_id, email, name, properties } = inputData;
  const claims = _.pickBy({ email, external_id }, (v, _k) => v !== undefined);
  return post({
    z,
    url: createUrl,
    body: { entityType: "user_event", claims, name, properties }
  });
};

const action = {
  key: "user_event",
  noun: "User Event",

  display: {
    // What the user will see in the Zap Editor when selecting an action
    label: "Create User Event",
    description:
      "Adds an Event to the user identified by an email. Will create the User if not created already"
  },

  operation: {
    // Data users will be asked to set in the Zap Editor
    inputFields: [
      {
        key: "email",
        label: "Email",
        helpText:
          "The email to associate the event to. If multiple emails are found in Hull, event will be associated to the oldest entry",
        required: false
      },
      {
        key: "external_id",
        helpText:
          "The external_id of the user to associate the event to. Takes precedence over the email if present",
        label: "External ID",
        required: false
      },
      {
        key: "name",
        label: "Event Name",
        helpText:
          "The Name of the event, such as 'Email Opened', 'Subscription Added', etc.",
        required: false
      },
      {
        key: "properties",
        label: "Event Properties",
        helpText: "A list of properties to store on the created event",
        dict: true,
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
