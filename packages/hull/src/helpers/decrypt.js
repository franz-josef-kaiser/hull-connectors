// @flow
import type { HullContext } from "../types";
import { decrypt } from "../utils/crypto";

const dec = (ctx: HullContext) => (config: any) =>
  decrypt(config, ctx.connectorConfig.hostSecret);
export default dec;
