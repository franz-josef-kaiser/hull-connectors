// @flow

import type { HullEntityClaims, HullEntityType, HullContext } from "hull";
import _ from "lodash";
import type { Payload } from "../types";
import compute from "./compute";
import ingest from "./ingest";
import saveRecent from "./save-recent";

const asyncComputeAndIngest = async (
  ctx: HullContext,
  {
    EntryModel,
    payload,
    source,
    code,
    claims,
    entityType,
    preview = false
  }: {
    source: string,
    code: string,
    entityType?: HullEntityType,
    claims: HullEntityClaims,
    payload: Payload,
    EntryModel?: Object,
    preview?: boolean
  }
) => {
  const { client } = ctx;
  try {
    const result = await compute(ctx, {
      source,
      claims,
      payload,
      entityType,
      code,
      preview
    });
    if (!preview) {
      // TODO: Check how errors in the second await could not have a defined error
      await ingest(ctx, result, claims, payload);
    }
    if (EntryModel) {
      await saveRecent(ctx, { EntryModel, payload, code, result });
    }
    return result;
  } catch (err) {
    client.logger.error(`incoming.${entityType || "payload"}.error`, {
      hull_summary: `Error ingesting payload: ${_.get(
        err,
        "message",
        "Unexpected error"
      )}`,
      err
    });
    throw err;
  }
};

export default asyncComputeAndIngest;
