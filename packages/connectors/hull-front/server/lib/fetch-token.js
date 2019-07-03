/* @flow */
import type { NextFunction } from "express";
import type { HullRequest, HullResponse } from "hull";
import url from "url";
import _ from "lodash";

export default function fetchToken(
  req: HullRequest,
  res: HullResponse,
  next: NextFunction
) {
  const pathname = url.parse(req.url).pathname || "";
  const clientCredentialsEncryptedToken =
    _.get(pathname.match("/webhooks/(?:[a-zA-Z0-9]*)/(.*)"), "[1]") ||
    _.get(req, "query.conf");
  if (clientCredentialsEncryptedToken) {
    req.hull = req.hull || {};
    req.hull.clientCredentialsEncryptedToken = clientCredentialsEncryptedToken;
  }
  next();
}
