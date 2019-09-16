const req = async ({ z, url, body, method = "POST" }) => {
  const response = await z.request({
    url,
    body,
    method
  });
  return response.json;
};

export const post = async (z, opts) => req(z, { method: "POST", ...opts });
export const del = async (z, opts) => req(z, { method: "DELETE", ...opts });
export const get = async (z, opts) => req(z, { method: "POST", ...opts });
