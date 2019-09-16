"use strict";

const { auth, userSearch } = require("./actions");
// const { encrypt, decrypt } = require("./lib/crypto");

function server(connector, options = {}, app) {
  const { hostSecret } = options;

  // app.post("/batch", actions.notify());
  // app.post("/smart-notifier", actions.notify({
  //   type: "next",
  //   size: parseInt(process.env.FLOW_CONTROL_SIZE, 10) || 100,
  //   in: parseInt(process.env.FLOW_CONTROL_IN, 10) || 10
  // }));
  // app.post("/notify", actions.notify());
  // app.all("/status", actions.statusCheck);
  app.use(function (req, res, next) {
    console.log(req);
    next();
  });
  app.get("/admin.html", (req, res) => {
    const { config } = req.hull;
    const { ship: id } = config;
    res.render("admin.html", { config, token: encrypt(req.hull.config, hostSecret) });
  });

  app.post("/auth", auth({ hostSecret, connector }));
  app.post("/user", userSearch({ hostSecret, connector }));
  return app;
}

module.exports = server;