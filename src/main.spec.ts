import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

jest.mock("@nestjs/core", () => ({
  __esModule: true,
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      useGlobalPipes: jest.fn().mockReturnThis(),
      useGlobalFilters: jest.fn().mockReturnThis(),
      useGlobalInterceptors: jest.fn().mockReturnThis(),
      listen: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock("@nestjs/common", () => ({
  __esModule: true,
  ValidationPipe: jest.fn().mockImplementation(() => ({
    transform: jest.fn(),
  })),
}));

jest.mock("@nestjs/swagger", () => ({
  __esModule: true,
  DocumentBuilder: jest.fn().mockReturnValue({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  }),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
}));

jest.mock("./app.module", () => ({
  AppModule: {},
}));

jest.mock("./common/filters/http-exception.filter", () => ({
  __esModule: true,
  HttpExceptionFilter: jest.fn().mockImplementation(() => ({
    catch: jest.fn(),
  })),
}));

jest.mock("./common/interceptors/transform.interceptor", () => ({
  __esModule: true,
  TransformInterceptor: jest.fn().mockImplementation(() => ({
    intercept: jest.fn(),
  })),
}));

describe("Bootstrap", () => {
  it("should bootstrap the application with the correct configuration", async () => {
    await import("./main");

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(ValidationPipe).toHaveBeenCalled();
    expect(DocumentBuilder).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      "api-docs",
      expect.any(Object),
      expect.any(Object)
    );
    expect(HttpExceptionFilter).toHaveBeenCalled();
    expect(TransformInterceptor).toHaveBeenCalled();
  });
});
