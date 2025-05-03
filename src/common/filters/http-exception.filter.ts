import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { WrapperResponse } from "../dtos/wrapper-response.dto";

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = "Internal server error";
    let error: string | undefined;

    if (typeof exceptionResponse === "string") {
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === "object") {
      const response = exceptionResponse as ExceptionResponse;
      message = Array.isArray(response.message)
        ? response.message[0]
        : response.message || message;
      error = response.error;
    }

    const responseBody = new WrapperResponse(
      status,
      message,
      error ? { error, details: message } : null
    );

    this.logger.error(
      `HTTP Exception: ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined
    );

    res.status(status).json(responseBody);
  }
}
