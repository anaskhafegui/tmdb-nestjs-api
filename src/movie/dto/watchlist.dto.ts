import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class WatchlistDto {
  @ApiProperty({
    description: "Whether the movie is marked as favorite",
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;
}
