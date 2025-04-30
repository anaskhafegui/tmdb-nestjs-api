import { ApiProperty } from "@nestjs/swagger";
import { WatchlistDataDto } from "./watchlist-data.dto";

export class WatchlistResponseDto {
  @ApiProperty({
    description: "Status code of the response",
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: "Message describing the response",
    example: "Watchlist retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "The watchlist data",
    type: [WatchlistDataDto],
  })
  data: WatchlistDataDto[];
}

export class WatchlistListResponseDto {
  @ApiProperty({
    description: "Status code of the response",
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: "Message describing the response",
    example: "Watchlist retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "List of watchlist items",
    type: [WatchlistDataDto],
  })
  data: WatchlistDataDto[];
}
