import { ApiProperty } from "@nestjs/swagger";

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: "Status code of the response",
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: "Message describing the response",
    example: "Data retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "The paginated data",
    type: [Object],
  })
  data: T[];

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: "Total number of items",
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 10,
  })
  totalPages: number;
}
