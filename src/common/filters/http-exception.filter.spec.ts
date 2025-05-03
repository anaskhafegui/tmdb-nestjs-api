import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { WrapperResponse } from "../dtos/wrapper-response.dto";
import { HttpExceptionFilter } from "./http-exception.filter";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: "/test",
      method: "GET",
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it("should transform HTTP exceptions", () => {
    const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.BAD_REQUEST, "Test error", null)
    );
  });

  it("should handle non-HTTP exceptions", () => {
    const exception = new Error("Test error");
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Internal server error",
        null
      )
    );
  });

  it("should handle HTTP exceptions with response object", () => {
    const exception = new HttpException(
      { message: "Test error", error: "Bad Request" },
      HttpStatus.BAD_REQUEST
    );
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.BAD_REQUEST, "Test error", {
        error: "Bad Request",
        details: "Test error",
      })
    );
  });

  it("should handle validation errors", () => {
    const exception = new HttpException(
      { message: ["Validation error"], error: "Bad Request" },
      HttpStatus.BAD_REQUEST
    );
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.BAD_REQUEST, "Validation error", {
        error: "Bad Request",
        details: "Validation error",
      })
    );
  });

  it("should handle unauthorized errors", () => {
    const exception = new HttpException(
      "Unauthorized",
      HttpStatus.UNAUTHORIZED
    );
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", null)
    );
  });

  it("should handle not found errors", () => {
    const exception = new HttpException("Not Found", HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.NOT_FOUND, "Not Found", null)
    );
  });

  it("should handle forbidden errors", () => {
    const exception = new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.FORBIDDEN, "Forbidden", null)
    );
  });

  it("should handle conflict errors", () => {
    const exception = new HttpException("Conflict", HttpStatus.CONFLICT);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.CONFLICT, "Conflict", null)
    );
  });

  it("should handle custom error messages", () => {
    const exception = new HttpException(
      { message: "Custom error", error: "Custom Error" },
      HttpStatus.BAD_REQUEST
    );
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.BAD_REQUEST, "Custom error", {
        error: "Custom Error",
        details: "Custom error",
      })
    );
  });

  it("should handle empty error messages", () => {
    const exception = new HttpException("", HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.BAD_REQUEST, "", null)
    );
  });

  it("should handle null error messages", () => {
    const exception = new HttpException(null, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.BAD_REQUEST, "Internal server error", null)
    );
  });

  it("should handle undefined error messages", () => {
    const exception = new HttpException(undefined, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      new WrapperResponse(HttpStatus.BAD_REQUEST, "Internal server error", null)
    );
  });
});
