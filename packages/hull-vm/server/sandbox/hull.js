// @flow
import type {
  HullAccountClaims,
  HullUserClaims,
  HullClient,
  HullAttributeContext,
  HullEventProperties,
  HullEventContext
} from "hull";
import { Map } from "immutable";
import type {
  HullAliasOperation,
  Attributes,
  // Event,
  Result
} from "../../types";

import {
  hasValidUserClaims,
  hasValidAccountClaims,
  hasValidLinkclaims
} from "../validate-claims";

const { applyContext } = require("hull-client/src/utils/traits");
const { filterEntityClaims } = require("hull-client/src/lib/filter-claims");

const buildHullContext = (
  client: HullClient,
  result: Result,
  eventsource?: string
) => {
  const errorLogger = (message, method, validation) => {
    client.logger.debug(`incoming.${message}.skip`, {
      method,
      validation
    });
    result.errors.push(
      `Error validating claims for ${method}  ${JSON.stringify(validation)}`
    );
  };

  const deprecationLogger = message =>
    message && result.logs.unshift(`Warning: ${message}`);

  const trackFactory = (claims: HullUserClaims, target: string) => (
    eventName: string,
    properties: HullEventProperties = {},
    context: HullEventContext = {}
  ) => {
    result[target].push({
      claims: filterEntityClaims("user", claims),
      event: {
        eventName,
        properties,
        context: { source: eventsource, ...context }
      }
    });
  };
  const aliasFactory = <ClaimType = HullUserClaims | HullAccountClaims>(
    claims: ClaimType,
    operation: HullAliasOperation,
    target: "userAliases" | "accountAliases"
  ) => (alias: ClaimType) => {
    // sets the rigth operation for the claim and the given alias.
    // perform deep value equality checks.
    result[target] = result[target].setIn(
      [
        Map(
          filterEntityClaims(
            target === "userAliases" ? "user" : "account",
            claims
          )
        ),
        Map({ ...alias })
      ],
      operation
    );
  };

  const identifyFactory = <ClaimType = HullUserClaims | HullAccountClaims>(
    claims: ClaimType,
    target: "userTraits" | "accountTraits"
  ) => (attributes: Attributes, context?: HullAttributeContext = {}) => {
    // ensures the claims and calls are properly collapsed and aggregated
    result[target] = result[target].withMutations(map => {
      map.mergeDeepIn(
        [
          Map(
            filterEntityClaims(
              target === "userTraits" ? "user" : "account",
              claims
            )
          )
        ],
        Map(applyContext(attributes, context))
      );
    });
  };

  function asAccountFactory(claims: HullAccountClaims, isLinkCall?: boolean) {
    const validation =
      isLinkCall === true
        ? hasValidLinkclaims(claims, client)
        : hasValidAccountClaims(claims, client);
    const { valid, message } = validation;
    if (!valid) {
      errorLogger("user", "Hull.asAccount()", validation);
      return {};
    }
    deprecationLogger(message);
    const identify = identifyFactory(claims, "accountTraits");
    const alias = aliasFactory(claims, "alias", "accountAliases");
    const unalias = aliasFactory(claims, "unalias", "accountAliases");
    return { identify, traits: identify, alias, unalias };
  }

  const linksFactory = (claims: HullUserClaims) => (
    accountClaims: HullAccountClaims
  ) => {
    const account = asAccountFactory(accountClaims, true);
    if (!account.traits) {
      return {};
    }
    result.accountLinks = result.accountLinks.set(
      Map(filterEntityClaims("user", claims)),
      Map(filterEntityClaims("account", accountClaims))
    );
    return account;
  };

  const asAccount = (claims: HullAccountClaims) => asAccountFactory(claims);

  function asUser(claims: HullUserClaims) {
    const validation = hasValidUserClaims(claims, client);
    const { valid, error, message } = validation;
    if (!valid || error) {
      errorLogger("user", "Hull.asUser()", validation);
      return {};
    }
    deprecationLogger(message);
    const track = trackFactory(claims, "events");
    const alias = aliasFactory(claims, "alias", "userAliases");
    const unalias = aliasFactory(claims, "unalias", "userAliases");
    const identify = identifyFactory(claims, "userTraits");
    const link = linksFactory(claims);
    return {
      traits: identify,
      account: link,
      alias,
      unalias,
      identify,
      track
    };
  }

  return {
    /* Deprecated Syntax */
    user: asUser,
    account: asAccount,
    /* Proper Syntax */
    asUser,
    asAccount
  };
};

export default buildHullContext;
