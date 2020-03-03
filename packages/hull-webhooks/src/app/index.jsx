/* global document */

import ready from "domready";
import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import Engine from "hull-webhooks/src/app/engine";
import { OutgoingUI } from "hull-vm/src/ui";

const renderApp = ({ empty, notFound, title }) => {
  const render = Component => {
    const root = document.getElementById("app");
    const engine = new Engine();
    ReactDOM.render(
      <AppContainer>
        <Component
          engine={engine}
          strings={{
            leftColumnTitle: title,
            leftColumnPreview: empty,
            leftColumnEmpty: notFound
          }}
        />
      </AppContainer>,
      root
    );
  };

  ready(() => render(OutgoingUI));

  if (module.hot) {
    module.hot.accept("./app", () => {
      render(OutgoingUI);
    });
  }
};

export default renderApp;
