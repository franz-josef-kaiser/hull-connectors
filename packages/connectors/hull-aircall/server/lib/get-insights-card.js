// @flow
import type { HullContext } from "hull";
import type { CallEvent, PhoneNumber, Email } from "../types";

const getValues = (
  items: Array<PhoneNumber | Email>,
  prefix?: string
): Array<string> => items.map(i => `${prefix || ""}${i.value}`);

export default async function(ctx: HullContext, event: CallEvent) {
  const { clientCredentials } = ctx;
  const { organization } = clientCredentials;
  const { data } = event;
  const { contact } = data;
  const { phone_numbers, emails, id } = contact;
  const payload = await ctx.entities.users.get({
    claims: {
      anonymous_id: [`aircall:${id}`, ...getValues(phone_numbers, "phone:")],
      email: getValues(emails)
    }
  });
  const { user } = payload.data[0];

  const prfix = `https://dashboard.hullapp.io/${organization.split(".")[0]}`;
  // Aircall Contact ID.
  return [
    [
      {
        type: "title",
        text: `${user.name || user.email}`,
        link: `${prfix}/users/${user.id}`
      },
      {
        type: "shortText",
        label: "View in Hull",
        text: "Open user profile",
        link: `${prfix}/users/${user.id}`
      }
    ]
  ];
}
