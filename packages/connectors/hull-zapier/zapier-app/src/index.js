import authentication from "./authentication";

// requires because we need module.exports to avoid having `defaults`;
const searches = require("./searches");
const creates = require("./creates");
const triggers = require("./triggers");
const resources = require("./resources");
// import * as resources from "./resources";

const platformVersion = require("zapier-platform-core").version;
const version = require("../package.json").version;

// To include the API key on all outbound requests, simply define a function here.
// It runs runs before each request is sent out, allowing you to make tweaks to the request in a centralized spot.

const includeApiKey = (request, z, bundle) => {
  if (bundle.authData.token) {
    request.url = `${request.url}?token=${bundle.authData.token}`;
    // request.params = request.params || {};
    // request.params.api_key =
    //   bundle.authData.apiKey || process.env.HULL_TEST_TOKEN;
    // //
    // // request.headers.Authorization = bundle.authData.apiKey;
    // // (If you want to include the key as a header instead)
    // //
  }
  return request;
};

const parseResponse = (response, z, _bundle) => {
  const { status, content } = response;
  if (status >= 500) {
    throw new Error(content);
  }
  if (status >= 400) {
    throw new z.errors.HaltedError(content);
  }
  response.json = z.JSON.parse(content);
  return response;
};

// We can roll up all our behaviors in an App.
const App = {
  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we can upload
  version,

  platformVersion,

  authentication,

  // beforeRequest & afterResponse are optional hooks into the provided HTTP client
  beforeRequest: [includeApiKey],

  afterResponse: [parseResponse],

  // If you want to define optional resources to simplify creation of triggers, searches, creates - do that here!
  resources,

  // If you want your trigger to show up, you better include it here!
  triggers,

  // If you want your searches to show up, you better include it here!
  searches,

  // If you want your creates to show up, you better include it here!
  creates
};

// Finally, export the app.
module.exports = App;
