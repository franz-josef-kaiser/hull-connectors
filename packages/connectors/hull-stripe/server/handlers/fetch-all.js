const Stripe = require("stripe");
const fetchHistory = require("../lib/fetch-history");

async function fetchAll(req, res) {
  const { ship, client } = req.hull;
  req.hull.stripe = Stripe(ship.private_settings.token);
  client.logger.info("incoming.batch.start");
  try {
    const response = await fetchHistory(req.hull);
    client.logger.info("incoming.batch.success");
    res.send({ ...response, status: "ok" });
  } catch (err) {
    client.logger.info("incoming.batch.error", err);
    res.send({ status: "error", err });
  }
}

module.exports = fetchAll;
