import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query } = req;

    this.loggerService.info(
      `Incoming Request: ${method} ${originalUrl} - Body: ${JSON.stringify(
        body,
      )} - Query: ${JSON.stringify(query)}`,
    );

    res.on('finish', () => {
      const { statusCode, statusMessage } = res;

      this.loggerService.info(
        `Outgoing Response: ${statusCode} ${statusMessage} - Body: ${JSON.stringify(
          res.locals.data,
        )}`,
      );
    });

    next();
  }
}
