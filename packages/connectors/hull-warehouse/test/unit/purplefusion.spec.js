/* @flow */
const _ = require("lodash");

const { PurpleFusionTestHarness } = require("hull-connector-framework/src/purplefusiontester/purplefusion-test-harness");

describe("Warehouse User Tests", () => {

  const harness = new PurpleFusionTestHarness(
    require("../../server/glue"),
    { postgres: require("../../server/postgres-sequalize-service") },
    [],
    "ensureHook");


  it("test unconfigured status", () => {
    return harness.runTest(require("./fixtures/status-notconfigured"));
  });

  it("test merge event", () => {
    return harness.runTest(require("./fixtures/outgoing-merge-event"));
  });
});
