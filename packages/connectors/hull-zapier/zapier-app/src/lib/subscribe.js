const _ = require("lodash");
const { subscribeUrl } = require("../config");

function subscribe({ entityType, action }) {
  return async (z, bundle) => {
    const { targetUrl } = bundle;
    const inputData = _.get(bundle, "inputData", {});

    const response = await z.request({
      url: subscribeUrl,
      body: {
        url: targetUrl,
        action,
        entityType,
        inputData
      },
      method: "POST"
    });
    return response.json;
  };
}

module.exports = {
  subscribe
};
