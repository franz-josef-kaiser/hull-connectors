// @flow
import type { HullContext, HullExternalResponse } from "hull";

const credentials = (_ctx: HullContext): HullExternalResponse => {
  return {
    status: 200,
    data: {
      ok: true
    }
  };
};

export default credentials;
