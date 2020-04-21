const _ = require("lodash");
const Hull = require("hull");

const ships = [
  { ship: "", secret: "", organization: ".hullapp.io" }
];
(async () => {
  _.forEach(ships, ship => {
    const hullClient = new Hull.Client({
      id: ship.ship,
      secret: ship.secret,
      organization: ship.organization
    });
    hullClient.utils.settings.update({
      webhook_id_person: undefined,
      webhook_id_org: undefined,
      webhook_id: undefined
    });
  });
})();

console.log("Done");
