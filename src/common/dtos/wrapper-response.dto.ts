import { ApiProperty } from "@nestjs/swagger";

export class WrapperResponse<T> {
  @ApiProperty({ name: "status_code", example: 200 })
  status_code: number;

  @ApiProperty({ name: "message", example: "Success" })
  message: string;

  @ApiProperty({ name: "result" })
  result: T;

  constructor(statusCode: number, message: string, data: T) {
    this.status_code = statusCode;
    this.message = message;
    this.result = data;
  }
}
