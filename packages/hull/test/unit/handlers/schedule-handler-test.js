/* global describe, it */
const { expect, should } = require("chai");
const sinon = require("sinon");
const httpMocks = require("node-mocks-http");
const { EventEmitter } = require("events");
const Promise = require("bluebird");
const HullStub = require("../../support/hull-stub");
const buildContextBaseStub = require("../../support/context-stub");
const { ConfigurationError, TransientError } = require("../../../src/errors");

const scheduleHandler = require("../../../src/handlers/schedule-handler/factory");

const expectNoErrorMetricStub = {
  mergeContext: () => {},
  increment: () => {},
  captureException: error => {
    expect(false).to.equal(true);
  }
};

describe("scheduleHandler", () => {
  it("should support json values", done => {
    const request = httpMocks.createRequest({
      method: "POST",
      url: "/",
      body: {
        connector: {},
        users_segments: [],
        accounts_segments: []
      }
    });
    request.hull = buildContextBaseStub();
    const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
    scheduleHandler({
      method: "POST",
      options: { },
      callback: () => Promise.resolve({ status: 200, data: { ok: "done" } })
    }).router.handle(request, response, err => {
      console.log(err);
    });
    response.on("end", () => {
      expect(response._isEndCalled()).to.be.ok;
      expect(response._getData()).to.equal('{"ok":"done"}');
      done();
    });
  });

  it("should support plain error return values", done => {
    const request = httpMocks.createRequest({
      method: "POST",
      url: "/",
      body: {
        connector: {},
        users_segments: [],
        accounts_segments: []
      }
    });
    request.hull = buildContextBaseStub();
    const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
    scheduleHandler({
      options: {
        respondWithError: true
      },
      callback: () => {
        return Promise.reject(new Error("Something went bad"));
      }
    }).router.handle(request, response, err => {
      done();
    });
  });

  it("should support thrown errors", done => {
    const request = httpMocks.createRequest({
      method: "POST",
      url: "/"
    });
    request.hull = buildContextBaseStub();
    const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
    scheduleHandler({
      options: {
        respondWithError: true
      },
      callback: () => {
        throw new Error("thrown error");
      }
    }).router.handle(request, response, () => {
      done();
    });
  });

  it("should support fire&forget strategy", done => {
    const request = httpMocks.createRequest({
      method: "POST",
      url: "/",
      body: {
        connector: {},
        users_segments: [],
        accounts_segments: []
      }
    });
    request.hull = buildContextBaseStub();
    const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
    scheduleHandler({
      callback: () => {
        return Promise.resolve({ ok: "done" });
      },
      options: {
        fireAndForget: true
      }
    }).router.handle(request, response, err => {
      console.log(err);
    });
    response.on("end", () => {
      expect(response._isEndCalled()).to.be.ok;
      expect(response._getData()).to.equal('{"status":"deferred"}');
      done();
    });
  });

  it("should capture errors in fire&forget mode", done => {
    const request = httpMocks.createRequest({
      method: "POST",
      url: "/",
      body: {
        connector: {},
        users_segments: [],
        accounts_segments: []
      }
    });
    request.hull = buildContextBaseStub({ exception: "boom", done });
    const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
    scheduleHandler({
      callback: () => {
        return Promise.reject(new Error("boom"));
      },
      options: {
        fireAndForget: true
      }
    }).router.handle(request, response, err => {
      console.log(err);
    });
    response.on("end", () => {
      expect(response._isEndCalled()).to.be.ok;
      expect(response._getData()).to.equal('{"status":"deferred"}');
    });
  });

  it("should not capture configuration errors in fire&forget mode", done => {
    const request = httpMocks.createRequest({
      method: "POST",
      url: "/",
      body: {
        connector: {},
        users_segments: [],
        accounts_segments: []
      }
    });
    request.hull = buildContextBaseStub({ exception: "boom" });
    setTimeout(() => {
      done();
    }, 300);
    const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
    scheduleHandler({
      callback: () => {
        return Promise.reject(new ConfigurationError("boom"));
      },
      options: {
        fireAndForget: true
      }
    }).router.handle(request, response, err => {
      console.log(err);
    });
    response.on("end", () => {
      expect(response._isEndCalled()).to.be.ok;
      expect(response._getData()).to.equal('{"status":"deferred"}');
    });
  });

  it("should not capture transient errors in fire&forget mode", done => {
    const request = httpMocks.createRequest({
      method: "POST",
      url: "/",
      body: {
        connector: {},
        users_segments: [],
        accounts_segments: []
      }
    });
    request.hull = buildContextBaseStub();
    setTimeout(() => done(), 300);
    const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
    scheduleHandler({
      callback: () => {
        return Promise.reject(new TransientError("boom"));
      },
      options: {
        fireAndForget: true
      }
    }).router.handle(request, response, err => {
      console.log(err);
    });
    response.on("end", () => {
      expect(response._isEndCalled()).to.be.ok;
      expect(response._getData()).to.equal('{"status":"deferred"}');
    });
  });
});
