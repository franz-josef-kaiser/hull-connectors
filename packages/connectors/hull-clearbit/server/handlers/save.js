// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullExternalResponse
} from "hull";
import { saveProspects } from "../lib/side-effects";

const prospect = async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): HullExternalResponse => {
  // $FlowFixMe
  const { prospects } = message.body;
  if (!prospects || !prospects.length) {
    return { status: 400, data: { error: "No Prospects to save" } };
  }
  await saveProspects({ ctx, prospects });
  // await Promise.all(
  //   prospects.map(person =>
  //     saveProspect(ctx, { person, account: { domain: person.domain } })
  //   )
  // );
  return { status: 200, data: { ok: true } };
};
export default prospect;
