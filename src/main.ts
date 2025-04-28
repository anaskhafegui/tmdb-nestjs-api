import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe (strips unknown props, auto-transforms types)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global response wrapper
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global error handler
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(9000);
}
bootstrap();
