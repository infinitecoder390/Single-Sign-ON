import { AuthModule } from './module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@app/common/middlewares/http-exceptions.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AllExceptionsFilter } from '@app/common/middlewares/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, { cors: true });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  const config = app.get<ConfigService>(ConfigService);

  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: config.get('AUTHENTICATION_SERVICE_TCP_PORT'),
    },
  });

  app.enableCors();

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  const dconfig = new DocumentBuilder()
    .setTitle('Authentication Servie')
    .setDescription('Authentication Service')
    .setVersion('1.0')
    .addTag('Authentication')
    .build();
  const document = SwaggerModule.createDocument(app, dconfig);
  SwaggerModule.setup('authentication_service/api-doc', app, document);

  await app.startAllMicroservices();

  await app.listen(config.get('PORT'));
}
bootstrap();
