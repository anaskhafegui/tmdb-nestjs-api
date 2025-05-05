import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PaginationDto } from "./pagination.dto";

describe("PaginationDto", () => {
  let paginationDto: PaginationDto;

  beforeEach(() => {
    paginationDto = new PaginationDto();
  });

  it("should be defined", () => {
    expect(paginationDto).toBeDefined();
  });

  it("should have default values", () => {
    expect(paginationDto.page).toBe(1);
    expect(paginationDto.limit).toBe(10);
  });

  it("should validate with default values", async () => {
    const errors = await validate(paginationDto);
    expect(errors.length).toBe(0);
  });

  it("should validate with valid values", async () => {
    paginationDto.page = 2;
    paginationDto.limit = 20;

    const errors = await validate(paginationDto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation with invalid page number", async () => {
    const dto = plainToInstance(PaginationDto, { page: "invalid" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("page");
  });

  it("should fail validation with page less than 1", async () => {
    paginationDto.page = 0;
    const errors = await validate(paginationDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("page");
  });

  it("should fail validation with invalid limit", async () => {
    const dto = plainToInstance(PaginationDto, { limit: "invalid" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("limit");
  });

  it("should fail validation with limit less than 1", async () => {
    paginationDto.limit = 0;
    const errors = await validate(paginationDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("limit");
  });

  it("should fail validation with decimal page number", async () => {
    const dto = plainToInstance(PaginationDto, { page: 1.5 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("page");
  });

  it("should fail validation with decimal limit", async () => {
    const dto = plainToInstance(PaginationDto, { limit: 10.5 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("limit");
  });
});
