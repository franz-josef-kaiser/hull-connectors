// @flow
import _ from "lodash";
import type { HullManifest, HullConnector } from "../types";

const debug = require("debug")("hull:apply-connector-settings-default");

function applyDefaults(
  manifestSettings = [],
  connectorSettings = {},
  manifest
) {
  manifestSettings.forEach(setting => {
    if (!setting.name || !setting.default) {
      return;
    }
    if (connectorSettings[setting.name] !== undefined) {
      return;
    }
    const def =
      _.isString(setting.default) && setting.default.indexOf("#/") === 0
        ? _.get(
            manifest,
            setting.default.replace(/^#\//, "").replace(/\//g, ".")
          )
        : setting.default;
    debug("applying default", {
      name: setting.name,
      currentValue: typeof connectorSettings[setting.name],
      defaultValue: def
    });
    connectorSettings[setting.name] = def;
  });
}

function applyConnectorSettingsDefaults(
  connector: HullConnector,
  staticManifest: HullManifest
) {
  if (!connector || !connector.manifest) {
    debug("return early");
    return;
  }

  const { manifest } = connector;
  debug("picked from req", {
    connector: typeof connector,
    manifest: typeof manifest
  });

  applyDefaults(
    manifest.private_settings,
    connector.private_settings,
    staticManifest
  );
  applyDefaults(manifest.settings, connector.settings, staticManifest);
}

module.exports = applyConnectorSettingsDefaults;
