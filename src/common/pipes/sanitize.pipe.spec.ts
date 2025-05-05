import { ArgumentMetadata } from "@nestjs/common";
import * as sanitizeHtml from "sanitize-html";
import * as xss from "xss";
import { SanitizePipe } from "./sanitize.pipe";

jest.mock("xss", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((value) => value),
}));

jest.mock("sanitize-html", () => ({
  __esModule: true,
  sanitize: jest.fn().mockImplementation((value) => value),
}));

describe("SanitizePipe", () => {
  let pipe: SanitizePipe;
  let metadata: ArgumentMetadata;

  beforeEach(() => {
    pipe = new SanitizePipe();
    metadata = {
      type: "body",
      metatype: String,
      data: "",
    };
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(pipe).toBeDefined();
  });

  it("should sanitize string values", () => {
    const input = '<script>alert("xss")</script>test';
    const result = pipe.transform(input, metadata);
    expect(xss.default).toHaveBeenCalledWith(input);
    expect(sanitizeHtml.sanitize).toHaveBeenCalledWith(input, {
      allowedTags: [],
      allowedAttributes: {},
    });
    expect(result).toBe(input);
  });

  it("should sanitize object values", () => {
    const input = {
      name: '<script>alert("xss")</script>test',
      nested: {
        value: "<p>Safe <b>HTML</b></p>",
      },
    };
    const result = pipe.transform(input, metadata);
    expect(xss.default).toHaveBeenCalledTimes(2);
    expect(sanitizeHtml.sanitize).toHaveBeenCalledTimes(2);
    expect(result).toEqual(input);
  });

  it("should handle non-string values", () => {
    const input = {
      number: 42,
      boolean: true,
      nullValue: null,
      array: [1, 2, 3],
    };
    const result = pipe.transform(input, metadata);
    expect(result).toEqual({
      number: 42,
      boolean: true,
      nullValue: null,
      array: [1, 2, 3],
    });
  });

  it("should handle array values", () => {
    const input = ['<script>alert("xss")</script>', "<p>Safe HTML</p>"];
    const result = pipe.transform(input, metadata);
    expect(xss.default).toHaveBeenCalledTimes(2);
    expect(sanitizeHtml.sanitize).toHaveBeenCalledTimes(2);
    expect(result).toEqual(input);
  });

  it("should handle null and undefined", () => {
    expect(pipe.transform(null, metadata)).toBeNull();
    expect(pipe.transform(undefined, metadata)).toBeUndefined();
  });
});
