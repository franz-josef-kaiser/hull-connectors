const _ = require("lodash");
const flatten = require("flat");
const objectMapper = require("object-mapper");
const subscription = require("../mappers/subscription");
const charge = require("../mappers/charge");
const invoice = require("../mappers/invoice");

const MAP = { subscription, charge, invoice };

function getEventProperties({ data }) {
  const { object } = data;
  const map = MAP[object.object];
  const properties = objectMapper(object, map) || {};

  return {
    ...properties,
    ...flatten(_.pick(object, "previous_attributes"), { delimiter: "_" }),
    ...flatten(_.pick(object, "metadata"), { delimiter: "_" })
  };
}

module.exports = getEventProperties;
