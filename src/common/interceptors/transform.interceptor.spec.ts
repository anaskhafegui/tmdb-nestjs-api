import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { WrapperResponse } from "../dtos/wrapper-response.dto";
import { TransformInterceptor } from "./transform.interceptor";

describe("TransformInterceptor", () => {
  let interceptor: TransformInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new TransformInterceptor();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    };
  });

  it("should transform response data into standard format", (done) => {
    const responseData = { test: "data" };
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(responseData)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toBeInstanceOf(WrapperResponse);
        expect(value).toEqual({
          status_code: 200,
          message: "Success",
          result: responseData,
        });
        done();
      },
    });
  });

  it("should handle null response data", (done) => {
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(null)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toBeInstanceOf(WrapperResponse);
        expect(value).toEqual({
          status_code: 200,
          message: "Success",
          result: null,
        });
        done();
      },
    });
  });

  it("should handle undefined response data", (done) => {
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(undefined)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toBeInstanceOf(WrapperResponse);
        expect(value).toEqual({
          status_code: 200,
          message: "Success",
          result: undefined,
        });
        done();
      },
    });
  });

  it("should handle array responses", (done) => {
    const arrayResponse = [{ id: 1 }, { id: 2 }];
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(arrayResponse)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toBeInstanceOf(WrapperResponse);
        expect(value).toEqual({
          status_code: 200,
          message: "Success",
          result: arrayResponse,
        });
        done();
      },
    });
  });

  it("should handle empty array responses", (done) => {
    const emptyArrayResponse = [];
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(emptyArrayResponse)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toBeInstanceOf(WrapperResponse);
        expect(value).toEqual({
          status_code: 200,
          message: "Success",
          result: emptyArrayResponse,
        });
        done();
      },
    });
  });

  it("should handle string responses", (done) => {
    const stringResponse = "Success message";
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(stringResponse)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toBeInstanceOf(WrapperResponse);
        expect(value).toEqual({
          status_code: 200,
          message: "Success",
          result: stringResponse,
        });
        done();
      },
    });
  });

  it("should handle number responses", (done) => {
    const numberResponse = 42;
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(numberResponse)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toBeInstanceOf(WrapperResponse);
        expect(value).toEqual({
          status_code: 200,
          message: "Success",
          result: numberResponse,
        });
        done();
      },
    });
  });

  it("should handle boolean responses", (done) => {
    const booleanResponse = true;
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(booleanResponse)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toBeInstanceOf(WrapperResponse);
        expect(value).toEqual({
          status_code: 200,
          message: "Success",
          result: booleanResponse,
        });
        done();
      },
    });
  });

  it("should handle error responses", (done) => {
    const error = new Error("Test error");
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => error)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
        done();
      },
    });
  });
});
