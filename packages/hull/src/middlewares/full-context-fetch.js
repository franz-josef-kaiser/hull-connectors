// @flow
import type { NextFunction } from "express";
import type { HullRequest, HullContext, HullResponse } from "../types";

const debug = require("debug")("hull-connector:full-context-fetch-middleware");

const {
  applyConnectorSettingsDefaults,
  trimTraitsPrefixFromConnector
} = require("../utils");

function fetchConnector(ctx): Promise<*> {
  debug("fetchConnector", typeof ctx.connector);
  if (ctx.connector) {
    return Promise.resolve(ctx.connector);
  }
  return ctx.cache.wrap(
    "connector",
    () => {
      debug("fetchConnector - calling API");
      return ctx.client.get("app", {});
    },
    { ttl: 60000 }
  );
}

function fetchSegments(ctx, entityType = "user") {
  debug("fetchSegments", entityType, typeof ctx[`${entityType}sSegments`]);
  if (ctx.client === undefined) {
    return Promise.reject(new Error("Missing client"));
  }
  if (ctx[`${entityType}sSegments`]) {
    return Promise.resolve(ctx[`${entityType}sSegments`]);
  }
  const { id } = ctx.client.configuration();
  return ctx.cache.wrap(
    `${entityType}s_segments`,
    () => {
      if (ctx.client === undefined) {
        return Promise.reject(new Error("Missing client"));
      }
      debug("fetchSegments - calling API");
      return ctx.client.get(
        `/${entityType}s_segments`,
        { shipId: id },
        {
          timeout: 5000,
          retry: 1000
        }
      );
    },
    { ttl: 60000 }
  );
}

function fetchEventSchema(ctx: HullContext) {
  debug("fetchSegments");
  if (ctx.client === undefined) {
    return Promise.reject(new Error("Missing client"));
  }
  if (ctx.eventSchema) {
    return Promise.resolve(ctx.eventSchema);
  }
  const { id } = ctx.client.configuration();
  return ctx.cache.wrap(
    "/search/event/bootstrap",
    () => {
      if (ctx.client === undefined) {
        return Promise.reject(new Error("Missing client"));
      }
      debug("fetchEventSchema - calling API");
      return ctx.client.get(
        "/search/event/bootstrap",
        {
          timeout: 5000,
          retry: 1000
        }
      );
    },
    { ttl: 60000 }
  );}
/**
 * This middleware is responsible for fetching all information
 * using initiated `req.hull.client`.
 * It's responsible for setting
 * - `req.hull.connector`
 * - `req.hull.usersSegments`
 * - `req.hull.accountsSegments`
 * It also honour existing values at this properties. If they are already set they won't be overwritten.
 */
function fullContextFetchMiddlewareFactory({
  requestName,
  strict = true
}: Object = {}) {
  return async function fullContextFetchMiddleware(
    req: HullRequest,
    res: HullResponse,
    next: NextFunction
  ) {
    if (req.hull === undefined || req.hull.client === undefined) {
      return next(
        new Error(
          "We need initialized client to fetch connector settings and segments lists"
        )
      );
    }

    try {
      const [connector, usersSegments, accountsSegments] = await Promise.all([
        fetchConnector(req.hull),
        fetchSegments(req.hull, "user"),
        fetchSegments(req.hull, "account")
      ]);
      debug("received responses %o", {
        connector: typeof connector,
        usersSegments: Array.isArray(usersSegments),
        accountsSegments: Array.isArray(accountsSegments)
      });
      if (strict && typeof connector !== "object") {
        return next(new Error("Unable to fetch connector object"));
      }

      if (strict && !Array.isArray(usersSegments)) {
        return next(new Error("Unable to fetch usersSegments array"));
      }

      if (strict && !Array.isArray(accountsSegments)) {
        return next(new Error("Unable to fetch accountsSegments array"));
      }
      const requestId = [requestName].join("-");

      applyConnectorSettingsDefaults(connector);
      trimTraitsPrefixFromConnector(connector);
      req.hull = Object.assign(req.hull, {
        requestId,
        connector,
        usersSegments,
        accountsSegments
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = fullContextFetchMiddlewareFactory;
