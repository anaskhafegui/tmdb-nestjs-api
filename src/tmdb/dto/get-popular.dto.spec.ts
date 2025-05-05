import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { GetPopularDto } from "./get-popular.dto";

describe("GetPopularDto", () => {
  let getPopularDto: GetPopularDto;

  beforeEach(() => {
    getPopularDto = new GetPopularDto();
  });

  it("should be defined", () => {
    expect(getPopularDto).toBeDefined();
  });

  it("should have default page value of 1", () => {
    expect(getPopularDto.page).toBe(1);
  });

  it("should validate a valid page number", async () => {
    getPopularDto.page = 5;

    const errors = await validate(getPopularDto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation with invalid page number type", async () => {
    const dto = plainToInstance(GetPopularDto, { page: "invalid" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("page");
  });

  it("should fail validation with decimal page number", async () => {
    const dto = plainToInstance(GetPopularDto, { page: 1.5 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("page");
  });

  it("should fail validation with page number less than 1", async () => {
    getPopularDto.page = 0;

    const errors = await validate(getPopularDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("page");
  });
});
