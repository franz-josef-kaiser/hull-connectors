// @flow
export type StripeEventType =
  | "invoice.created"
  | "charge.refunded"
  | "invoice.upcoming";

export type StripeAggregateUsageType =
  | "sum"
  | "last_during_period"
  | "last_ever"
  | "max";

export type StripeTiers = {
  flat_amount: ?number,
  flat_amount_decimal: ?number,
  unit_amount: ?number,
  unit_amount_decimal: ?number,
  up_to: ?number
};
export type StripeTiersMode = "graduated" | "volume";
export type StripePlan = {
  id: string,
  object: "plan",
  active: boolean,
  aggregate_usage: ?StripeAggregateUsageType,
  amount: number,
  billing_scheme: "per_unit" | "tiered",
  created: 1403023708,
  currency: "usd",
  interval: "month",
  interval_count: 1,
  livemode: boolean,
  metadata: {},
  nickname: null,
  product: "prod_BV8YVNiJ8zbzfz",
  tiers: ?Array<StripeTiers>,
  tiers_mode: ?StripeTiersMode,
  transform_usage: null,
  trial_period_days: null,
  usage_type: "licensed" | "metered"
};

export type StripeInvoiceType = "subscription";

export type StripeInvoiceLine = {
  id: number,
  type: StripeInvoiceType,
  object: "line_item",
  amount: number,
  currency: string,
  description: string,
  discountable: boolean,
  livemode: boolean,
  metadata: {},
  period: {
    end: number,
    start: number
  },
  plan: StripePlan,
  proration: boolean,
  quantity: number,
  subscription: string,
  subscription_item: string
};

export type StripeInvoice = {
  object: "invoice",
  amount_due: number,
  amount_paid: number,
  amount_remaining: number,
  application_fee: ?number,
  attempt_count: number,
  attempted: boolean,
  billing: string,
  billing_reason: string,
  charge: ?number,
  closed: boolean,
  currency: string,
  customer: string,
  date: string,
  description: ?string,
  discount: ?number,
  due_date: ?string,
  ending_balance: ?number,
  forgiven: boolean,
  lines: {
    object: "list",
    data: Array<StripeInvoiceLine>,
    has_more: boolean,
    total_count: number,
    url: string
  },
  livemode: boolean,
  metadata: {},
  next_payment_attempt: number,
  number: string,
  paid: boolean,
  period_end: number,
  period_start: number,
  receipt_number: ?number,
  starting_balance: number,
  statement_descriptor: ?string,
  subscription: string,
  subtotal: number,
  tax: ?number,
  tax_percent: ?number,
  total: number,
  webhooks_delivered_at: number
};

export type StripeStandardEventProps = {|
  id: string,
  object: "event",
  api_version: string,
  created: number,
  livemode: boolean,
  pending_webhooks: number,
  request: {
    id: ?string,
    idempotency_key: ?string
  },
  type: StripeEventType
|};

export type StripeCreatedEvent = {
  ...$Exact<StripeStandardEventProps>,
  data: {
    object: StripeInvoice,
    previous_attributes?: {
      [string]: any
    }
  }
};

export type StripeUpdatedEvent = {
  ...$Exact<StripeStandardEventProps>,
  data: {
    object: StripeInvoice,
    previous_attributes?: {
      [string]: any
    }
  }
};

export type StripeEvent = StripeUpdatedEvent | StripeCreatedEvent;
export type StripeCustomer = {
  id: string,
  email: string,
  metadata?: { [string]: string }
};
export type StripeCustomerHash = { [string]: StripeCustomer };
