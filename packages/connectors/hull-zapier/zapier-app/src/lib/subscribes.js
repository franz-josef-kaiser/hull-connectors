import { subscribeUrl, unsubscribeUrl } from "../config";
import { post } from "./request";

export const subscribe = ({ entityType, action }) => async (z, bundle) => {
  const { targetUrl, value } = bundle;
  post({
    z,
    url: subscribeUrl,
    body: {
      url: targetUrl,
      action,
      entityType,
      value
    }
  });
};
export const unsubscribe = ({ _entityType, _action }) => async (z, bundle) => {
  const { subscribeData } = bundle;
  return post({ z, url: unsubscribeUrl, body: subscribeData });
};
