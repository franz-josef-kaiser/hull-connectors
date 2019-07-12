// @flow
import type { HullContext, HullStatusResponse } from "hull";
import { check } from "hull-vm";

export default async function statusCheck(
  ctx: HullContext
): HullStatusResponse {
  const { connector } = ctx;
  const { private_settings = {} } = connector;
  const { code } = private_settings;

  if (check.empty(ctx, code)) {
    return {
      status: "warning",
      messages: [
        "This processor doesn't contain code. It is recommended for performance reasons to remove empty processors from your organization."
      ]
    };
  }

  if (check.pristine(ctx, code)) {
    return {
      status: "setupRequired",
      messages: [
        'This connector contains the default "hello world" code. If you need help writing code, please refer to the connector documentation.'
      ]
    };
  }

  let status = "ok";
  const messages = [];

  if (check.invalid(ctx, code)) {
    status = "error";
    messages.push(
      "The code didn't pass the syntax check. Please review the detected problems and apply fixes where indicated.."
    );
  }

  const lintMessages = check.lint(ctx, code);
  if (lintMessages.length) {
    status = "error";
    messages.push(...lintMessages);
  }

  return { messages, status };
}