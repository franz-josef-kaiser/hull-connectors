const _ = require("lodash");

const map = {
  "invoice.payment_failed": "Invoice Payment Failed",
  "invoice.payment_succeeded": "Invoice Payment Succeeded",
  "invoice.upcoming": "Invoice Upcoming",
  "invoice.updated": "Invoice Updated",
  "invoice.created": "Invoice Created",
  "charge.succeeded": "Charge succeeded",
  "charge.refunded": "Charge Refunded",
  "customer.subscription.updated": "Subscription Updated",
  "customer.subscription.created": "Subscription Created",
  "customer.subscription.deleted": "Subscription Ended"
};

function getEventName(event) {
  return _.get(map, event.type, null);
}

module.exports = getEventName;
