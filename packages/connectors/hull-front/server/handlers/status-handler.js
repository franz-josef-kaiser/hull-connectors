// @flow
import type { HullContext, HullStatusResponse } from "hull";
//
// const crypto = require("crypto");
//
// const apiSecret = "YOUR_API_SECRET";
//
// function validateFrontSignature(data, signature) {
//   const hash = crypto
//     .createHmac("sha1", apiSecret)
//     .update(JSON.stringify(data))
//     .digest("base64");
//
//   return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
// }

export default async function statusCheck(
  ctx: HullContext
): HullStatusResponse {
  const { connector } = ctx;
  const { private_settings = {} } = connector;
  const { api_key } = private_settings;
  if (!api_key) {
    return {
      messages: [
        "Missing API Key, Please enter the Front API Key in the Settings"
      ],
      status: "setupRequired"
    };
  }
  return { messages: [], status: "ok" };
}
