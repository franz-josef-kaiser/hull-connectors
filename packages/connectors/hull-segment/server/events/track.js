// @flow

import { reduce } from "lodash";
import type { HullContext } from "hull";
import scoped from "../lib/scope-hull-client";
import type {
  SegmentIncomingTrack,
  SegmentIncomingPage,
  SegmentIncomingScreen
} from "../types";

export default async function handleTrack(
  ctx: HullContext,
  message: SegmentIncomingTrack | SegmentIncomingPage | SegmentIncomingScreen
) {
  const {
    context = {},
    anonymousId,
    active,
    event,
    properties,
    userId,
    timestamp,
    originalTimestamp,
    sentAt,
    receivedAt
  } = message;

  const { connector, metric, client } = ctx;
  const { settings } = connector;

  const { page = {}, location = {}, userAgent, ip = "0" } = context;
  const { url, referrer: referer } = page;
  const { latitude, longitude } = location;

  const created_at = timestamp || receivedAt || sentAt || originalTimestamp;

  const _bid = anonymousId || userId;
  let _sid = (created_at || new Date().toISOString()).substring(0, 10);

  if (_bid) {
    _sid = [_bid, _sid].join("-");
  }

  const trackContext = reduce(
    {
      source: "segment",
      created_at,
      _bid,
      _sid,
      url,
      referer,
      useragent: userAgent,
      ip,
      latitude,
      longitude,
      active: active || context.active
    },
    (p, v, k) => {
      if (v !== undefined) {
        p[k] = v;
      }
      return p;
    },
    {}
  );

  const errorPayload = { userId, anonymousId };

  try {
    const asUser = scoped(client, message, settings, {});
    try {
      if (!event) {
        throw new Error("Event name is empty, can't track!");
      }
      await asUser.track(event, properties, trackContext);
      return undefined;
    } catch (err) {
      asUser.logger.error("incoming.track.error", {
        ...errorPayload,
        message: err.message,
        error: err
      });
      metric.increment("request.track.error");
      throw err;
    }
  } catch (e) {
    client.logger.error("incoming.user.error", {
      message: e.message,
      error: e
    });
    throw e;
  }
  // return undefined;
}
