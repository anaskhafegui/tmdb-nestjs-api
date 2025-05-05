import { PaginatedResponseDto } from "./paginated-response.dto";

interface TestData {
  id: number;
  name: string;
}

describe("PaginatedResponseDto", () => {
  let paginatedResponse: PaginatedResponseDto<TestData>;

  beforeEach(() => {
    paginatedResponse = new PaginatedResponseDto<TestData>();
    paginatedResponse.statusCode = 200;
    paginatedResponse.message = "Success";
    paginatedResponse.data = [];
    paginatedResponse.page = 1;
    paginatedResponse.limit = 10;
    paginatedResponse.total = 0;
    paginatedResponse.totalPages = 0;
  });

  it("should be defined", () => {
    expect(paginatedResponse).toBeDefined();
  });

  it("should have all required properties", () => {
    expect(paginatedResponse).toHaveProperty("statusCode");
    expect(paginatedResponse).toHaveProperty("message");
    expect(paginatedResponse).toHaveProperty("data");
    expect(paginatedResponse).toHaveProperty("page");
    expect(paginatedResponse).toHaveProperty("limit");
    expect(paginatedResponse).toHaveProperty("total");
    expect(paginatedResponse).toHaveProperty("totalPages");
  });

  it("should correctly set properties", () => {
    const testData: TestData[] = [
      { id: 1, name: "Test 1" },
      { id: 2, name: "Test 2" },
    ];

    paginatedResponse.statusCode = 200;
    paginatedResponse.message = "Success";
    paginatedResponse.data = testData;
    paginatedResponse.page = 1;
    paginatedResponse.limit = 10;
    paginatedResponse.total = 20;
    paginatedResponse.totalPages = 2;

    expect(paginatedResponse.statusCode).toBe(200);
    expect(paginatedResponse.message).toBe("Success");
    expect(paginatedResponse.data).toEqual(testData);
    expect(paginatedResponse.page).toBe(1);
    expect(paginatedResponse.limit).toBe(10);
    expect(paginatedResponse.total).toBe(20);
    expect(paginatedResponse.totalPages).toBe(2);
  });

  it("should work with empty data array", () => {
    paginatedResponse.statusCode = 200;
    paginatedResponse.message = "No data";
    paginatedResponse.data = [];
    paginatedResponse.page = 1;
    paginatedResponse.limit = 10;
    paginatedResponse.total = 0;
    paginatedResponse.totalPages = 0;

    expect(paginatedResponse.data).toEqual([]);
    expect(paginatedResponse.total).toBe(0);
    expect(paginatedResponse.totalPages).toBe(0);
  });

  it("should work with different data types", () => {
    const numberResponse = new PaginatedResponseDto<number>();
    const stringResponse = new PaginatedResponseDto<string>();

    numberResponse.data = [1, 2, 3];
    stringResponse.data = ["a", "b", "c"];

    expect(numberResponse.data).toEqual([1, 2, 3]);
    expect(stringResponse.data).toEqual(["a", "b", "c"]);
  });
});
