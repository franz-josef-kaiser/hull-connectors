// @flow
import type { HullContext } from "../types";
import { encrypt } from "../utils/crypto";

const enc = (ctx: HullContext) => (config: any) =>
  encrypt(config, ctx.connectorConfig.hostSecret);
export default enc;
