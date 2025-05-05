import { NextFunction, Request, Response } from "express";
import * as sanitizeHtml from "sanitize-html";
import * as xss from "xss";
import { SanitizeMiddleware } from "./sanitize.middleware";

jest.mock("xss", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((value) => value),
}));

jest.mock("sanitize-html", () => ({
  __esModule: true,
  sanitize: jest.fn().mockImplementation((value) => value),
}));

describe("SanitizeMiddleware", () => {
  let middleware: SanitizeMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new SanitizeMiddleware();
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(middleware).toBeDefined();
  });

  it("should sanitize query parameters", () => {
    mockRequest.query = {
      search: '<script>alert("xss")</script>test',
      filter: "<p>Safe HTML</p>",
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(xss.default).toHaveBeenCalledTimes(2);
    expect(sanitizeHtml.sanitize).toHaveBeenCalledTimes(2);
    expect(mockRequest.query).toEqual({
      search: '<script>alert("xss")</script>test',
      filter: "<p>Safe HTML</p>",
    });
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should sanitize request body", () => {
    mockRequest.body = {
      name: '<script>alert("xss")</script>test',
      description: "<p>Safe HTML</p>",
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(xss.default).toHaveBeenCalledTimes(2);
    expect(sanitizeHtml.sanitize).toHaveBeenCalledTimes(2);
    expect(mockRequest.body).toEqual({
      name: '<script>alert("xss")</script>test',
      description: "<p>Safe HTML</p>",
    });
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should sanitize request params", () => {
    mockRequest.params = {
      id: '<script>alert("xss")</script>test',
      name: "<p>Safe HTML</p>",
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(xss.default).toHaveBeenCalledTimes(2);
    expect(sanitizeHtml.sanitize).toHaveBeenCalledTimes(2);
    expect(mockRequest.params).toEqual({
      id: '<script>alert("xss")</script>test',
      name: "<p>Safe HTML</p>",
    });
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should handle non-string values", () => {
    mockRequest.body = {
      number: 42,
      boolean: true,
      nullValue: null,
      array: [1, 2, 3],
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockRequest.body).toEqual({
      number: 42,
      boolean: true,
      nullValue: null,
      array: [1, 2, 3],
    });
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should handle empty request object", () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );
    expect(nextFunction).toHaveBeenCalled();
  });
});
