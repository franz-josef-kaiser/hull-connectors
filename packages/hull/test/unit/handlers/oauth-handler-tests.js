// /* global describe, it */
// const http = require("http");
// const { expect, should } = require("chai");
// const sinon = require("sinon");
// const httpMocks = require("node-mocks-http");
// const { EventEmitter } = require("events");
// const passport = require("passport");
//
// const HullStub = require("../../support/hull-stub");
//
// const oauthHandler = require("../../../src/handlers/oauth-handler/factory");
//
// class StrategyStub extends passport.Strategy {
//   constructor() {
//     super();
//     this.name = "test";
//   }
//
//   authenticate(req) {
//     throw new Error("test");
//   }
// }
//
// describe("OAuthHandler", () => {
//   it("should handle oauth errors", done => {
//     const request = httpMocks.createRequest({
//       method: "POST",
//       url: "/login"
//     });
//     request.hull = {
//       HullClient: HullStub,
//       clientCredentials: {
//         id: "123",
//         secret: "123",
//         organization: "123"
//       },
//       connector: {},
//       usersSegments: [],
//       accountsSegments: [],
//       connectorConfig: {
//         hostSecret: "123"
//       },
//       cache: {
//         wrap: () => {}
//       }
//     };
//     const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
//     oauthHandler(
//       {
//         params: {
//           name: "Test",
//           views: {
//             failure: "oauth-failure-view.html"
//           }
//         }
//       },
//       () => ({
//         Strategy: StrategyStub
//       })
//     ).handle(request, response);
//     response.on("end", () => {
//       expect(response.statusCode).to.equal(200);
//       expect(response._getRenderView()).to.equal("oauth-failure-view.html");
//       done();
//     });
//   });
// });
