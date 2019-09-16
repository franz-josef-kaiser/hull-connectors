import { segmentsUrl, schemaUrl } from "../config";
import { post } from "./request";

export const segments = (entityType, { list } = {}) => async (z, _bundle) => {
  // Only fetch segments for Users and Accounts
  if (entityType !== "user" && entityType !== "account") {
    return [];
  }
  const choices = await post({
    z,
    url: segmentsUrl,
    body: {
      entityType
    }
  });
  return {
    key: "segments",
    required: true,
    list,
    label: `${entityType} segments`,
    helpText: `Which segments the ${entityType} needs to be in to execute trigger`,
    choices
  };
};

export const schema = (entityType, { list } = {}) => async (z, _bundle) => {
  const choices = await post({
    z,
    url: schemaUrl,
    body: {
      entityType
    }
  });
  return {
    key: entityType,
    required: true,
    list,
    label: `${entityType}`,
    choices
  };
};
export const userSegments = segments("users", { list: true });
export const accountSegments = segments("accounts", { list: true });

export const userSegment = segments("users");
export const accountSegment = segments("accounts");

export const accountSchema = schema("accounts");
export const userSchema = schema("users");

export const userEventSchema = schema("user_events", { list: true });
