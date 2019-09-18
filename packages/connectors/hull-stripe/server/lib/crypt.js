const crypto = require("crypto");

const algorithm = "aes-256-ctr";

function encrypt(text, hostSecret) {
  const cipher = crypto.createCipher(algorithm, hostSecret);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

function decrypt(text, hostSecret) {
  const decipher = crypto.createDecipher(algorithm, hostSecret);
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

module.exports = { encrypt, decrypt };
