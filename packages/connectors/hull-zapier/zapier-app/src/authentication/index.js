module.exports = {
  type: "custom",
  fields: [{ key: "token", label: "Token", required: true, type: "string" }],
  test: {
    url: "https://hull-staging-zapier.ngrok.io/auth"
  }
};
