import { validate } from "class-validator";
import { WatchlistDto } from "./watchlist.dto";

describe("WatchlistDto", () => {
  it("should validate with optional isFavorite field", async () => {
    const dto = new WatchlistDto();
    dto.isFavorite = true;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate without isFavorite field", async () => {
    const dto = new WatchlistDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate with false isFavorite field", async () => {
    const dto = new WatchlistDto();
    dto.isFavorite = false;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should not validate with non-boolean isFavorite field", async () => {
    const dto = new WatchlistDto();
    (dto as any).isFavorite = "not-a-boolean";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isBoolean");
  });
});
