import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("TMDB API")
    .setDescription("CRUD and sync with TMDB")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, doc);

  // Global validation pipe (strips unknown props, auto-transforms types)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
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
