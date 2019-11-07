// @flow
import type { HullContext } from "hull";
import type { CallEvent } from "../types";

export default function(ctx: HullContext, event: CallEvent) {
  const { data } = event;
  const { contact, phone_numbers, emails, id } = data;
  const payload = ctx.entity.users.get({
    claims: {
      anonymous_id: [...phone_numbers.map(p => `phone:${p}`), `aircall:${id}`],
      email: emails.map(e => e.value)
    }
  });

  // Aircall Contact ID.
  return [
    {
      type: "title",
      text: "Last support ticket",
      link: "https://my-custom-crm.com/12345"
    },
    {
      type: "shortText",
      text: "John Doe",
      label: "Account owner",
      link: "https://my-custom-crm.com/6789"
    }
  ];
}
