// @flow

import type { StripeEvent } from "../../types";

const MAP = {
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

const getEventName = (event: StripeEvent) => MAP[event.type] || null;

export default getEventName;
