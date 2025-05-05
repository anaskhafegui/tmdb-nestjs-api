import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ListMoviesDto } from "./list-movies.dto";

describe("ListMoviesDto", () => {
  let listMoviesDto: ListMoviesDto;

  beforeEach(() => {
    listMoviesDto = new ListMoviesDto();
  });

  it("should be defined", () => {
    expect(listMoviesDto).toBeDefined();
  });

  it("should have default values", () => {
    expect(listMoviesDto.page).toBe(1);
    expect(listMoviesDto.limit).toBe(20);
    expect(listMoviesDto.genre).toBeUndefined();
    expect(listMoviesDto.search).toBeUndefined();
  });

  it("should validate with default values", async () => {
    const errors = await validate(listMoviesDto);
    expect(errors.length).toBe(0);
  });

  it("should validate with valid values", async () => {
    listMoviesDto.page = 2;
    listMoviesDto.limit = 30;
    listMoviesDto.genre = "Action";
    listMoviesDto.search = "Matrix";

    const errors = await validate(listMoviesDto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation with invalid page number", async () => {
    const dto = plainToInstance(ListMoviesDto, { page: "invalid" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("page");
  });

  it("should fail validation with page less than 1", async () => {
    listMoviesDto.page = 0;
    const errors = await validate(listMoviesDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("page");
  });

  it("should fail validation with invalid limit", async () => {
    const dto = plainToInstance(ListMoviesDto, { limit: "invalid" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("limit");
  });

  it("should fail validation with limit less than 1", async () => {
    listMoviesDto.limit = 0;
    const errors = await validate(listMoviesDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("limit");
  });

  it("should fail validation with invalid genre type", async () => {
    const dto = plainToInstance(ListMoviesDto, { genre: 123 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("genre");
  });

  it("should fail validation with invalid search type", async () => {
    const dto = plainToInstance(ListMoviesDto, { search: 123 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("search");
  });
});
