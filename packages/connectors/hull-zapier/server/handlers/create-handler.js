// @flow
import type {
  HullContext,
  HullExternalResponse,
  HullIncomingHandlerMessage
} from "hull";

const credentials = async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): HullExternalResponse => {
  const { client } = ctx;
  const { body } = message;
  const {
    entityType = "user",
    claims,
    attributes,
    name,
    properties = {}
  } = body;
  const scoped = client[entityType === "account" ? "asAccount" : "asUser"](
    claims
  );
  if (entityType === "user_event") {
    await scoped.track(name, properties);
  } else {
    await scoped.traits(attributes);
  }

  return {
    status: 200,
    data: {
      ok: "true"
    }
  };
};

export default credentials;
