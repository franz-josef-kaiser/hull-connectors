// @flow

import type {
  HullUser,
  HullAccount,
  HullEvent,
  HullUserSegment,
  HullAccountSegment,
  HullEntityName
} from "./index";

export type HullFetchedUser = {
  user: HullUser,
  segments: Array<HullUserSegment>,
  segment_ids: Array<string>,
  events?: Array<HullEvent>,
  account?: HullAccount,
  account_segments?: Array<HullAccountSegment>,
  account_segment_ids?: Array<string>
};

export type HullFetchedAccount = {
  account: HullAccount,
  account_segments: Array<HullAccountSegment>,
  account_segment_ids: Array<string>
};

export type HullIncludedEvents = {
  names?: Array<string>,
  per_page?: number,
  page?: number
};

export type HullIncludedEntities = {
  events?: boolean | HullIncludedEvents,
  account?: boolean,
  users?: boolean
};

type StringOrArray = string | Array<string>;

export type HullGetEntityParams = {
  claims?: {
    email?: StringOrArray,
    domain?: StringOrArray,
    external_id?: StringOrArray,
    anonymous_id?: StringOrArray,
    id?: StringOrArray
  },
  search?: string,
  entity: HullEntityName,
  include?: HullIncludedEntities,
  per_page?: number,
  page?: number
};

export type HullGetEntityResponse<Entity> = {|
  pagination: {
    pages: number,
    per_page: number,
    page: number
  },
  data: Array<Entity>
|};

export type HullFetchedEvent = HullEvent;
export type HullGetUserResponse = HullGetEntityResponse<HullFetchedUser>;
export type HullGetAccountResponse = HullGetEntityResponse<HullFetchedAccount>;
