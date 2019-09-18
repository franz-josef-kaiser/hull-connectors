function statusCheck(req, res) {
  const { client } = req.hull;
  const messages = [];
  const status = "ok";
  res.json({ messages, status });
  return client.put(`${req.hull.ship.id}/status`, { status, messages });
}

module.exports = statusCheck;
