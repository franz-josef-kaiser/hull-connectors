// @flow
// import _ from "lodash";
// import fp from "lodash/fp";
import type {
  HullContext,
  HullSegmentDefinitionEntry,
  HullAttributeSchemaEntry,
  HullEventSchemaEntry
} from "../types/index";
// import { formatEvent } from "./format-event";

const EVENTS_ROUTE = "/search/event/bootstrap";
const USERS_ROUTE = "/users/schema";
const ACCOUNTS_ROUTE = "/accounts/schema";
const USER_SEGMENTS_ROUTE = "/users_segments?limit=100";
const ACCOUNT_SEGMENTS_ROUTE = "/accounts_segments?limit=100";
const get = (route: string) => (ctx: HullContext) => async (): Promise<
  Array<any>
> =>
  ctx.cache.wrap(
    route,
    () => ctx.client.get(route, { timeout: 5000, retry: 1000 }),
    { ttl: 60000 }
  );
export const getEventSchema: HullContext => () => Promise<
  Array<HullEventSchemaEntry>
> = get(EVENTS_ROUTE);
export const getUserSchema: HullContext => () => Promise<
  Array<HullAttributeSchemaEntry>
> = get(USERS_ROUTE);
export const getUserSegments: HullContext => () => Promise<
  Array<HullSegmentDefinitionEntry>
> = get(USER_SEGMENTS_ROUTE);
export const getAccountSchema: HullContext => () => Promise<
  Array<HullAttributeSchemaEntry>
> = get(ACCOUNTS_ROUTE);
export const getAccountSegments: HullContext => () => Promise<
  Array<HullSegmentDefinitionEntry>
> = get(ACCOUNT_SEGMENTS_ROUTE);
