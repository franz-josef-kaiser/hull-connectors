// @flow

export type HullEventSchemaEntry = {
  created_at: string,
  name: string,
  properties: Array<string>,
  updated_at: string,
  emitted: boolean
};

export type HullAttributeSchemaEntry = {
  key: string,
  type: "string" | "date" | "boolean" | "event" | "number" | "json",
  configurable: boolean,
  visible: boolean,
  track_changes: boolean
};

export type HullSegmentDefinitionEntry = {
  id: string,
  name: string,
  type: "users_segment" | "accounts_segment",
  query: {},
  predicate: {},
  referenced_attributes: Array<string>,
  referenced_events: Array<string>,
  fields_list: Array<string>,
  stats: {
    users?: number,
    accounts?: number
  },
  created_at: string,
  updated_at: string
};
