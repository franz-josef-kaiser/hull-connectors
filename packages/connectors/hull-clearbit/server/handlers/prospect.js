// @flow
import type {
  HullContext,
  HullIncomingHandlerMessage,
  HullExternalResponse
} from "hull";
import BluebirdPromise from "bluebird";
import _ from "lodash";

// import Promise from "bluebird";
import { performProspect } from "../clearbit/prospect";

const prospect = async (
  ctx: HullContext,
  message: HullIncomingHandlerMessage
): HullExternalResponse => {
  // $FlowFixMe
  const { domains, role, seniority, titles = [], limit } = message.body;
  if (!domains || !domains.length) {
    return { status: 400, data: { error: "Empty list of domains" } };
  }
  if (!titles || !titles.length) {
    return { status: 400, data: { error: "Empty list of titles" } };
  }
  const responses = await BluebirdPromise.mapSeries(domains, async domain => {
    const account = { domain };
    const { prospects } = await performProspect({
      ctx,
      settings: {
        ...ctx.connector.private_settings,
        prospect_filter_role: role,
        prospect_filter_seniority: seniority,
        prospect_filter_titles: titles,
        prospect_limit_count: limit
      },

      // $FlowFixMe
      message: { account }
    });
    return _.mapValues(prospects, p => ({ domain, ...p }));
  });
  const prospects = _.flatten(responses.map(_.values));
  if (!prospects.length) {
    return { status: 404, data: { error: "No results" } };
  }
  return { status: 200, data: { prospects: _.flatten(prospects) } };
};
export default prospect;
