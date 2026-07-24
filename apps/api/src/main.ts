import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors({
    origin: config.get<string>("corsOrigin"),
    credentials: true,
  });

  app.setGlobalPrefix("api");
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  if (config.get<string>("env") !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("ONE ORDER API")
      .setDescription("REST API for the ONE ORDER ordering platform")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  const port = config.get<number>("port") ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`ONE ORDER API running on http://localhost:${port}/api`);
}

bootstrap();
