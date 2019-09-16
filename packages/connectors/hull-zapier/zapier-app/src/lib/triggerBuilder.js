import _ from "lodash";
import { subscribe, unsubscribe } from "./subscribes";
import { post } from "./request";
import { segmentsUrl } from "../config";

const segmentsFor = entityType => async (z, _bundle) => {
  // Only fetch segments for Users and Accounts
  if (entityType !== "user" && entityType !== "account") {
    return [];
  }
  const choices = await post({
    z,
    url: segmentsUrl,
    body: {
      entityType
    }
  });
  return {
    key: "segments",
    required: true,
    label: `${entityType} segments`,
    helpText: `Which segments the ${entityType} needs to be in to execute trigger`,
    choices
  };
};

export default function triggerBuilder({ sample, noun, action }) {
  const titleAction = _.startCase(action);
  const titleNoun = _.startCase(noun);
  return {
    key: `${noun}_${action}`,

    // You'll want to provide some helpful display labels and descriptions
    // for users. Zapier will put them into the UX.
    noun,
    display: {
      label: `${titleNoun} ${titleAction}`,
      description: `Trigger when an ${titleNoun} is ${titleAction}.`
    },

    // `operation` is where we make the call to your API
    operation: {
      inputFields: [segmentsFor(noun)],

      type: "hook",

      performSubscribe: subscribe({ entityType: noun, action }),
      performUnsubscribe: unsubscribe({
        entityType: noun,
        action
      }),

      perform: (z, bundle) => [bundle.cleanedRequest],

      // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
      // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
      // returned records, and have obviously dummy values that we can show to any user.
      sample,

      // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
      // field definitions. The result will be used to augment the sample.
      // outputFields: () => { return []; }
      // Alternatively, a static field definition should be provided, to specify labels for the fields
      outputFields: []
    }
  };
}
