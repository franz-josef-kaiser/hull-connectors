"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = handleWebhook;
function handleWebhook({ hostSecret }) {
  return (req, res) => {
    const { status, type, body } = req.body;
    const { client: hull, ship } = req.hull;
    const { hostname } = req;
    const userId = req.hull.config.userId;

    if ((type === "person" || type === "person_company") && status === 200 && userId) {
      let person;

      if (type === "person") {
        person = body;
      } else if (type === "person_company") {
        person = Object.assign({}, body.person, { company: body.company });
      }

      if (person) {
        hull.logger.debug("webhook - person", { person: JSON.stringify(person) });
        const cb = new hull.as()({ hull, ship, hostSecret, hostname });
        cb.saveUser({ id: userId }, person, "enrich");
      }

      res.json({ message: "thanks" });
    } else {
      res.json({ message: "ignored" });
    }
  };
}