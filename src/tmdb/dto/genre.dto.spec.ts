import { validate } from "class-validator";
import { GenreDto } from "./genre.dto";

describe("GenreDto", () => {
  let genreDto: GenreDto;

  beforeEach(() => {
    genreDto = new GenreDto();
  });

  it("should be defined", () => {
    expect(genreDto).toBeDefined();
  });

  it("should validate a valid genre", async () => {
    genreDto.id = 18;
    genreDto.name = "Drama";

    const errors = await validate(genreDto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation with invalid id", async () => {
    genreDto.id = "invalid" as any;
    genreDto.name = "Drama";

    const errors = await validate(genreDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("id");
  });

  it("should fail validation with invalid name", async () => {
    genreDto.id = 18;
    genreDto.name = 123 as any;

    const errors = await validate(genreDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("name");
  });
});
