/* @flow */
import type { HullContext, HullUISelectGroup } from "hull";

import type { TypeformResponse, TypeformForm } from "../types";

const moment = require("moment");
const _ = require("lodash");
const striptags = require("striptags");
const { pipeStreamToPromise } = require("hull/src/utils");
const { ConfigurationError } = require("hull/src/errors");

const MappingUtil = require("./mapping-util");
const ServiceClient = require("./service-client");
const ServiceClientBridge = require("./service-client-bridge");

class SyncAgent {
  connector: *;

  mappingUtil: *;

  serviceClient: *;

  serviceClientBridge: *;

  hullClient: *;

  metric: *;

  formId: string;

  helpers: *;

  constructor(ctx: HullContext) {
    this.connector = ctx.connector;
    this.serviceClient = new ServiceClient({
      accessToken: this.connector.private_settings.access_token,
      refreshToken: this.connector.private_settings.refresh_token,
      clientId: process.env.CLIENT_ID || "",
      clientSecret: process.env.CLIENT_SECRET || "",
      client: ctx.client,
      metric: ctx.metric
    });
    this.serviceClientBridge = new ServiceClientBridge(this.serviceClient);
    this.mappingUtil = new MappingUtil({
      privateSettings: this.connector.private_settings
    });
    this.hullClient = ctx.client;
    this.metric = ctx.metric;
    this.formId = this.connector.private_settings.form_id;
    this.helpers = ctx.helpers;
  }

  isAuthorized() {}

  isConfigured() {
    const isNotEmptyString = str => {
      return typeof str === "string" && str !== "";
    };
    return (
      isNotEmptyString(this.connector.private_settings.form_id) &&
      isNotEmptyString(this.connector.private_settings.field_as_email)
    );
  }

  isConfigSynchronized() {
    return null;
  }

  async performPreflight() {
    if ((await this.isAuthorized()) === false) {
      return Promise.reject(
        new ConfigurationError("Connector is not authorized", {})
      );
    }
    return Promise.resolve();
  }

  async refreshAccessToken() {
    const timeTokensWereGranted = moment(
      this.connector.private_settings.tokens_granted_at,
      "X"
    );
    const durationTokensExpire = moment.duration(
      this.connector.private_settings.expires_in,
      "seconds"
    );
    const now = moment();
    const durationToRefreshBefore = moment.duration(6, "hours");

    const hasExpired = timeTokensWereGranted
      .add(durationTokensExpire)
      .isBefore(now.subtract(durationToRefreshBefore));

    if (hasExpired === false) {
      return Promise.resolve();
    }
    this.hullClient.logger.info("authorization.refresh-token.start");
    return this.serviceClient
      .refreshAccessToken()
      .then(response => {
        const accessToken = response.body.access_token;
        const refreshToken = response.body.refresh_token;
        const expiresIn = response.body.expires_in;

        return this.helpers.settingsUpdate({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn,
          tokens_granted_at: moment().format("X")
        });
      })
      .then(() => {
        this.hullClient.logger.info("authorization.refresh-token.success");
      })
      .catch(error => {
        this.hullClient.logger.error("authorization.refresh-token.error", {
          error: error.message
        });
      });
  }

  async fetchAllResponses() {
    try {
      this.hullClient.logger.info("incoming.job.start");
      const formResponse = await this.serviceClient.getForm(this.formId);
      const streamOfAllResponses = this.serviceClientBridge.getAllResponsesStream(
        this.formId
      );
      return pipeStreamToPromise(streamOfAllResponses, responses => {
        this.hullClient.logger.info("incoming.job.progress", {
          progress: responses.length
        });
        return this.saveResponses(formResponse.body, responses);
      })
        .then(() => {
          this.hullClient.logger.info("incoming.job.success");
        })
        .catch(error => {
          this.hullClient.logger.error("incoming.job.error", {
            error: error.message
          });
        });
    } catch (error) {
      return this.hullClient.logger.error("incoming.job.error", {
        error: error.message
      });
    }
  }

  async fetchRecentResponses() {
    const fetchStartAt = moment()
      .utc()
      .format();
    const previousFetchStartAt = this.connector.private_settings
      .last_fetch_recent_responses_start_at;

    this.hullClient.logger.info("incoming.job.start", { previousFetchStartAt });

    try {
      const formResponse = await this.serviceClient.getForm(this.formId);

      const streamOfRecentResponses = this.serviceClientBridge.getRecentResponsesStream(
        this.formId,
        { since: previousFetchStartAt }
      );

      return pipeStreamToPromise(streamOfRecentResponses, responses => {
        this.hullClient.logger.info("incoming.job.progress", {
          progress: responses.length
        });
        return this.saveResponses(formResponse.body, responses);
      })
        .then(() => {
          return this.helpers.settingsUpdate({
            last_fetch_recent_responses_start_at: fetchStartAt
          });
        })
        .then(() => {
          this.hullClient.logger.info("incoming.job.success", { fetchStartAt });
        })
        .catch(error => {
          this.hullClient.logger.error("incoming.job.error", error);
        });
    } catch (error) {
      return this.hullClient.logger.error("incoming.job.error", {
        error: error.message
      });
    }
  }

  async getForms() {
    const response = await this.serviceClient.getForms();
    return response.body.items.map(f => ({ label: f.title, value: f.id }));
  }

  async getFormResponsesCount() {
    const response = await this.serviceClient.getResponses(this.formId, {
      completed: true,
      pageSize: 1
    });
    return response.body.total_items;
  }

  async getQuestions({ type = null }: Object = {}): Promise<
    Array<HullUISelectGroup>
  > {
    const { body } = await this.serviceClient.getForm(this.formId);
    return [
      {
        label: "questions",
        options: _.chain(body.fields)
          // .filter(syncAgent.isNotHidden)
          .thru(fields => {
            return (
              fields.filter(f => {
                if (type) {
                  return f.type === type;
                }
                return true;
              }) || fields
            );
          })
          .map(f => {
            return { label: striptags(f.title), value: f.id };
          })
          .uniqBy("label")
          .value()
      },
      {
        label: "hidden",
        options: _.chain(body.hidden)
          // .filter(syncAgent.isHidden)
          .map(f => {
            return { label: f, value: f };
          })
          .uniqBy("label")
          .value()
      }
    ];
  }

  saveResponses(
    form: TypeformForm,
    responses: Array<TypeformResponse>
  ): Promise<*> {
    return Promise.all(
      responses.map(response => {
        const userClaims = this.mappingUtil.getHullUserClaims(response);
        const userAttributes = this.mappingUtil.getHullUserAttributes(response);
        const eventContext = this.mappingUtil.getHullUserEventContext(response);
        const eventProperties = this.mappingUtil.getHullUserEventProperties(
          form,
          response
        );
        const asUser = this.hullClient.asUser(userClaims);
        if (Object.keys(userClaims).length === 0) {
          asUser.logger.debug("incoming.user.skip", {
            reason:
              "No identification claims defined, please refer to Identification section of documentation",
            rawResponse: response
          });
          return null;
        }

        this.metric.increment("ship.incoming.users", 1);

        asUser.logger.debug("incoming.user.success", userAttributes);
        asUser.logger.debug("incoming.user-event.success", {
          event: "Form Submitted",
          eventProperties,
          eventContext
        });

        return Promise.all([
          asUser.traits(userAttributes),
          asUser.track("Form Submitted", eventProperties, eventContext)
        ]);
      })
    );
  }
}

module.exports = SyncAgent;
