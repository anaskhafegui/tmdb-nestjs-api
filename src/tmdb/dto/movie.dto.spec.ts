import { validate } from "class-validator";
import { MovieDto } from "./movie.dto";

describe("MovieDto", () => {
  let movieDto: MovieDto;

  beforeEach(() => {
    movieDto = new MovieDto();
  });

  it("should be defined", () => {
    expect(movieDto).toBeDefined();
  });

  it("should validate a valid movie with required fields", async () => {
    movieDto.id = 550;
    movieDto.title = "Fight Club";
    movieDto.overview = "A depressed man...";

    const errors = await validate(movieDto);
    expect(errors.length).toBe(0);
  });

  it("should validate a valid movie with all fields", async () => {
    movieDto.id = 550;
    movieDto.title = "Fight Club";
    movieDto.overview = "A depressed man...";
    movieDto.poster_path = "/adw6Lq9FiC9zjYEpOqfq03ituwp.jpg";
    movieDto.release_date = "1999-10-15";
    movieDto.genre_ids = [18, 35];

    const errors = await validate(movieDto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation with invalid id", async () => {
    movieDto.id = "invalid" as any;
    movieDto.title = "Fight Club";
    movieDto.overview = "A depressed man...";

    const errors = await validate(movieDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("id");
  });

  it("should fail validation with invalid title", async () => {
    movieDto.id = 550;
    movieDto.title = 123 as any;
    movieDto.overview = "A depressed man...";

    const errors = await validate(movieDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("title");
  });

  it("should fail validation with invalid overview", async () => {
    movieDto.id = 550;
    movieDto.title = "Fight Club";
    movieDto.overview = 123 as any;

    const errors = await validate(movieDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("overview");
  });

  it("should fail validation with invalid poster_path", async () => {
    movieDto.id = 550;
    movieDto.title = "Fight Club";
    movieDto.overview = "A depressed man...";
    movieDto.poster_path = 123 as any;

    const errors = await validate(movieDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("poster_path");
  });

  it("should fail validation with invalid release_date", async () => {
    movieDto.id = 550;
    movieDto.title = "Fight Club";
    movieDto.overview = "A depressed man...";
    movieDto.release_date = 123 as any;

    const errors = await validate(movieDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("release_date");
  });

  it("should fail validation with invalid genre_ids", async () => {
    movieDto.id = 550;
    movieDto.title = "Fight Club";
    movieDto.overview = "A depressed man...";
    movieDto.genre_ids = ["invalid"] as any;

    const errors = await validate(movieDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("genre_ids");
  });

  it("should fail validation with non-integer genre_ids", async () => {
    movieDto.id = 550;
    movieDto.title = "Fight Club";
    movieDto.overview = "A depressed man...";
    movieDto.genre_ids = [18.5, 35.7];

    const errors = await validate(movieDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("genre_ids");
  });
});
