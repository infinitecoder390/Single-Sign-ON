// logger.service.ts

import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ApplicationConstants, LogLevel } from '../utils/application-contants';
import { level } from 'winston';

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;
  timezoned = () => {
    return new Date().toLocaleString('en-US', {
      timeZone: ApplicationConstants.ASIA_KOLKATA,
    });
  };
  constructor() {
    this.logger = winston.createLogger({
      level: LogLevel.DEBUG,
      format: winston.format.combine(
        winston.format.timestamp({ format: this.timezoned }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
          level: LogLevel.ERROR,
          format: winston.format.json(),
          dirname: ApplicationConstants.LOG_DIRECTORY_PATH,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxFiles: '7d',
        }),
        new DailyRotateFile({
          level:
            process.env.ENV === ApplicationConstants.DEV_ENV
              ? LogLevel.DEBUG
              : LogLevel.INFO,
          format: winston.format.json(),
          dirname: ApplicationConstants.LOG_DIRECTORY_PATH,
          filename: 'authorization-' + level + '-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxFiles: '7d',
        }),
      ],
    });
  }

  error(message: string, trace?: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  info(message: string) {
    this.logger.info(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
