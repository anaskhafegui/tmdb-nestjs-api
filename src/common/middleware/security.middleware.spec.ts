import { NextFunction, Request, Response } from "express";
import * as helmet from "helmet";
import { SecurityMiddleware } from "./security.middleware";

jest.mock("helmet", () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      () => (req: Request, res: Response, next: NextFunction) => next()
    ),
}));

describe("SecurityMiddleware", () => {
  let middleware: SecurityMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new SecurityMiddleware();
    mockRequest = {};
    mockResponse = {
      header: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should be defined", () => {
    expect(middleware).toBeDefined();
  });

  it("should apply helmet security headers", () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );
    expect(helmet.default).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should set CORS headers", () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );
    expect(mockResponse.header).toHaveBeenCalledWith(
      "Access-Control-Allow-Origin",
      "*"
    );
    expect(mockResponse.header).toHaveBeenCalledWith(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    expect(mockResponse.header).toHaveBeenCalledWith(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  });

  it("should set XSS protection headers", () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );
    expect(mockResponse.header).toHaveBeenCalledWith(
      "X-Content-Type-Options",
      "nosniff"
    );
    expect(mockResponse.header).toHaveBeenCalledWith("X-Frame-Options", "DENY");
    expect(mockResponse.header).toHaveBeenCalledWith(
      "X-XSS-Protection",
      "1; mode=block"
    );
  });

  it("should call next function", () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );
    expect(nextFunction).toHaveBeenCalled();
  });
});
