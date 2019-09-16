import _ from "lodash";
import { subscribe, unsubscribe } from "./subscribes";

export default function triggerBuilder({ inputFields, noun, action }) {
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
      inputFields: _.compact([inputFields]),
      resource: noun,
      type: "hook",
      performSubscribe: subscribe({ entityType: noun, action }),
      performUnsubscribe: unsubscribe({ entityType: noun, action }),
      perform: (z, bundle) => [bundle.cleanedRequest]
    }
  };
}
