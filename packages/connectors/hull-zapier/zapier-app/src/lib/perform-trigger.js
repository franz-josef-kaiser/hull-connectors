const _ = require("lodash");

function getEntityParent(entityType) {
  if (entityType === "user_event") {
    return "user";
  }
  if (entityType === "user") {
    return "account";
  }
  return null;
}


function segmentInZapierWhitelist(
  entityType,
  inputData,
  entity = {},
  action,
  { multi_entity_segment_filtering } = { multi_entity_segment_filtering: false }
) {
  const zapierSegmentWhitelist = _.get(
    inputData,
    `${entityType}_segments`,
    []
  );
  if (_.isNil(action) || _.isNil(entityType) || _.isEmpty(zapierSegmentWhitelist)) {
    return false;
  }

  let segments =
    entityType === "user"
      ? _.get(entity, "segments", {})
      : _.get(entity, "account_segments", {});

  /*if (_.size(segments)) {
    return false;
  }*/

  if (action === "entered" || action === "left") {
    segments = segments[action] || [];
    if (_.isEmpty(segments)) {
      return false;
    }
  }
  if (_.includes(zapierSegmentWhitelist, `all_${entityType}_segments`)) {
    return true;
  }

  const segmentIds = _.map(segments, "id");
  const isWhitelisted = !_.isEmpty(_.intersection(zapierSegmentWhitelist, segmentIds));

  console.log(`is ${entityType} whitelisted: ${isWhitelisted} - msf: ${multi_entity_segment_filtering}`);
  if (!isWhitelisted) {
    return false;
  }

  const parentEntityType = getEntityParent(entityType);
  if (multi_entity_segment_filtering && !_.isNil(parentEntityType)) {
    return segmentInZapierWhitelist(
      parentEntityType,
      inputData,
      entity,
      action,
      multi_entity_segment_filtering
    );
  }

  return true;
}

function performSegmentChangedTrigger({ entityType, action }) {
  return async (z, bundle) => {

    const cleanedRequest = _.get(bundle, "cleanedRequest", []);
    const messages = !_.isArray(cleanedRequest) ? [cleanedRequest] : cleanedRequest;
    const inputData = _.get(bundle, "inputData", []);

    const filteredMessages = [];
    _.forEach(messages, message => {
      const changes = _.get(message, "changes", {});
      const multi_entity_segment_filtering = false;

      if (action === "entered_segment" || action === "left_segment") {
        const segmentActedOn = segmentInZapierWhitelist(
          entityType,
          inputData,
          changes,
          action.substring(0, action.indexOf("_")),
          multi_entity_segment_filtering
        );

        if (segmentActedOn) {
          filteredMessages.push(message);
        } else {
          z.console.log("skipping message:", {
            entityType,
            inputData,
            message_id: message.message_id,
            user_segments: message.segments,
            account_segments: message.account_segments,
            user_changes: message.changes.user,
            user_segment_changes: message.changes.segments,
            account_changes: message.changes.account,
            account_segment_changes: message.changes.account_segments
          });
        }
      }
    });

    return filteredMessages;
  };
}

function isValidMessage(z, bundle, entityType, message, action) {

  const inputData = _.get(bundle, "inputData", []);
  const multi_entity_segment_filtering = true;

  const hasMatchingSegments = segmentInZapierWhitelist(
    entityType,
    inputData,
    message,
    action.substring(0, action.indexOf("_")),
    multi_entity_segment_filtering
  );

  const entityAttributeChanges = _.get(message.changes, entityType, {});

  const changedAttributes = _.reduce(
    entityAttributeChanges,
    (changeList, value, key) => {
      changeList.push(key);
      return changeList;
    },
    []
  );

  const zapierAttributesWhitelist = _.get(bundle, `inputData.${entityType}_attributes`, []);

  const hasMatchingChangedAttributes =
    _.isEmpty(zapierAttributesWhitelist) || !_.isEmpty(_.intersection(zapierAttributesWhitelist, changedAttributes));

  if (!hasMatchingChangedAttributes || !hasMatchingSegments) {
    z.console.log("skipping message:", {
      message_id: message.message_id,
      entityType,
      inputData,
      hasMatchingChangedAttributes,
      hasMatchingSegments
    });
    return false;
  }

  const parentEntityType = getEntityParent(entityType);
  if (!_.isNil(parentEntityType)) {
    return isValidMessage(z, bundle, parentEntityType, message, action);
  }
  return true;
}

function performAttributesUpdatedTrigger({ entityType, action }) {
  return async (z, bundle) => {
    const cleanedRequest = _.get(bundle, "cleanedRequest", []);
    const messages = !_.isArray(cleanedRequest) ? [cleanedRequest] : cleanedRequest;

    const filteredMessages = [];
    _.forEach(messages, message => {

      const hasUserChanges = !_.isEmpty(_.get(message, "changes.user", {}));
      const hasAccountChanges = !_.isEmpty(_.get(message, "changes.account", {}));

      const hasUserAttributes = !_.isEmpty(_.get(bundle, `inputData.user_attributes`, []));
      const hasAccountAttributes = !_.isEmpty(_.get(bundle, `inputData.account_attributes`, []));

      if ((hasUserAttributes || hasAccountAttributes) && (hasUserChanges || hasAccountChanges)) {
        if (isValidMessage(z, bundle, entityType, message, action)) {
          filteredMessages.push(message);
        }
      } else {
        z.console.log("skipping message:", {
          message_id: message.message_id,
          entityType,
          inputData: _.get(bundle, "inputData", []),
          hasUserAttributes,
          hasAccountAttributes,
          hasUserChanges,
          hasAccountChanges
        });
      }
    });

    return filteredMessages;
  };
}

function performEventCreatedTrigger({ entityType, action }) {
  return async (z, bundle) => {
    const cleanedRequest = _.get(bundle, "cleanedRequest", []);
    const messages = !_.isArray(cleanedRequest) ? [cleanedRequest] : cleanedRequest;

    const zapierUseEventsWhitelist = _.get(bundle, "inputData.user_events", []);
    const inputData = _.get(bundle, "inputData", []);

    const filteredMessages = [];
    _.forEach(messages, message => {
      const userEvents = _.map(_.get(message, "events", []), "event");
      const hasMatchingSegments = segmentInZapierWhitelist(
        "user",
        inputData,
        message,
        action
      );

      if (!_.isEmpty(userEvents) && hasMatchingSegments &&
        !_.isEmpty(_.intersection(userEvents, zapierUseEventsWhitelist))) {
          filteredMessages.push(message);
      } else {
        z.console.log("skipping message:", {
          message_id: message.message_id,
          entityType,
          hasMatchingSegments
        });
      }
    });

    return filteredMessages;
  };
}

function performEntityCreatedTrigger({ entityType, action}) {
  return async (z, bundle) => {
    const cleanedRequest = _.get(bundle, "cleanedRequest", []);
    const inputData = _.get(bundle, "inputData", []);
    const messages = !_.isArray(cleanedRequest) ? [cleanedRequest] : cleanedRequest;
    const filteredMessages = [];
    _.forEach(messages, message => {
      const entityAttributeChanges = _.get(message, "changes", {});
      const isNew = _.get(entityAttributeChanges, "is_new", false);
      const entity = _.get(message, entityType, {});

      const multi_entity_segment_filtering = true;

      const hasMatchingSegments = segmentInZapierWhitelist(
        entityType,
        inputData,
        message,
        action.substring(0, action.indexOf("_")),
        multi_entity_segment_filtering
      );

      if (hasMatchingSegments && isNew && _.size(entity) > 0) {
        filteredMessages.push(message);
      } else {
        z.console.log("skipping message:", {
          message_id: message.message_id,
          entityType,
          hasMatchingSegments,
          isNew
        });
      }
    });
    return filteredMessages;
  }
}

function performEntityDeletedTrigger({ entityType, action}) {
  return async (z, bundle) => {
    const cleanedRequest = _.get(bundle, "cleanedRequest", []);
    const messages = !_.isArray(cleanedRequest) ? [cleanedRequest] : cleanedRequest;
    const filteredMessages = [];
    _.forEach(messages, message => {

    });
    return filteredMessages;
  }
}

module.exports = {
  performSegmentChangedTrigger,
  performAttributesUpdatedTrigger,
  performEventCreatedTrigger,
  performEntityCreatedTrigger,
  performEntityDeletedTrigger
};
