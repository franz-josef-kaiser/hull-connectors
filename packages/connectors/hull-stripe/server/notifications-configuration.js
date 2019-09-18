const { updateStripeMapping } = require("./actions");

module.exports = {
  "ship:update": ctx => updateStripeMapping(ctx),
  "segment:update": ctx => updateStripeMapping(ctx),
  "user:update": ctx => updateStripeMapping(ctx)
};
