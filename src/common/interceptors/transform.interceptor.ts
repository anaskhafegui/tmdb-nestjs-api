import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable, map } from "rxjs";
import { WrapperResponse } from "../dtos/wrapper-response.dto";

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, WrapperResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<WrapperResponse<T>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next
      .handle()
      .pipe(map((data) => new WrapperResponse(statusCode, "Success", data)));
  }
}
