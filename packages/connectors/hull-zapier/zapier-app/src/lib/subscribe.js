const { subscribeUrl } = require("../config");

function subscribe({ entityType, action }) {
  return async (z, bundle) => {
    const { targetUrl } = bundle;
    const response = await z.request({
      url: subscribeUrl,
      body: {
        url: targetUrl,
        action,
        entityType
      },
      method: "POST"
    });
    return response.json;
  };
}

module.exports = {
  subscribe
};
