import { AuthorizationServiceModule } from './module';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@app/common/middlewares/all-exceptions.filter';
import { HttpExceptionFilter } from '@app/common/middlewares/http-exceptions.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AuthorizationServiceModule);
  // app.setGlobalPrefix('authorization_service');

  app.enableVersioning({
    type: VersioningType.URI,
  });
  const config = app.get<ConfigService>(ConfigService);

  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: config.get('AUTHORIZATION_SERVICE_TCP_PORT'),
    },
  });

  app.enableCors();

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  const dconfig = new DocumentBuilder()
    .setTitle('Authorization Service')
    .setDescription('Authorization Service')
    .setVersion('1.0')
    .addTag('Authorization')
    .build();
  const document = SwaggerModule.createDocument(app, dconfig);
  SwaggerModule.setup('authorization_service/api-doc', app, document);
  await app.startAllMicroservices();

  await app.listen(config.get('PORT'));
}
bootstrap();
