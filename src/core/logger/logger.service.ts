import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';

const MILLISECONDS_IN_SECOND = 60000;

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly logsDirectory = 'logs';

  private readonly logFileName = 'logs';

  private readonly logFileExtension = 'log';

  private readonly maxLogFileSize = 3_072_000;

  constructor() {
    super();
  }
  private getLogFilePath(subdomain?: string): string {
    const subdomainPath = subdomain ? `/${subdomain}` : '';
    return `${this.logsDirectory}${subdomainPath}/${this.logFileName}.${this.logFileExtension}`;
  }

  private clearLogFile(filePath: string): void {
    try {
      fs.truncateSync(filePath);
    } catch (error) {
      super.error(error);
    }
  }

  private checkLogFileSize(filePath: string): void {
    try {
      const stats = fs.statSync(filePath);

      if (stats.size >= this.maxLogFileSize) {
        this.clearLogFile(filePath);
      }
    } catch (error) {
      super.error(error);
    }
  }

  private logToFile(
    message: string,
    context?: string,
    subdomain?: string,
  ): void {
    try {
      const logFilePath = this.getLogFilePath(subdomain);

      this.checkLogFileSize(logFilePath);

      const timezoneOffset =
        new Date().getTimezoneOffset() * MILLISECONDS_IN_SECOND;

      fs.ensureFileSync(logFilePath);
      fs.appendFileSync(
        logFilePath,
        `[${new Date(Date.now() - timezoneOffset)
          .toISOString()
          .slice(0, -1)}] [${context}] ${message}\n`,
      );
    } catch (error) {
      super.error(error);
    }
  }

  private messageStringifyer(message: unknown): string {
    return JSON.stringify(message);
  }

  private createContext(): string {
    const stackTrace = new Error().stack;
    const context = String(stackTrace.split('\n')[3])
      .trim()
      .split(' ')[1]
      .split('.')
      .join('\\');
    return context;
  }

  public debug(message: unknown, subdomain?: string): void {
    try {
      super.debug(
        `${chalk.blueBright('[DEBUG]')}: ${this.messageStringifyer(message)}`,
        this.createContext(),
      );

      this.logToFile(
        `${chalk.blueBright('[DEBUG]')}: ${this.messageStringifyer(message)}`,
        this.createContext(),
        subdomain,
      );
    } catch (error) {
      super.error(error);
    }
  }

  public info(message: unknown, subdomain?: string): void {
    try {
      super.log(
        `${chalk.bgYellow('[INFO]')}: ${this.messageStringifyer(message)}`,
        this.createContext(),
      );

      this.logToFile(
        `${chalk.bgYellow('[INFO]')}: ${this.messageStringifyer(message)}`,
        this.createContext(),
        subdomain,
      );
    } catch (error) {
      super.error(error);
    }
  }

  public warn(message: unknown, subdomain?: string): void {
    try {
      super.warn(
        `${chalk.red('[WARN]')}: ${this.messageStringifyer(message)}`,
        this.createContext(),
      );

      this.logToFile(
        `${chalk.red('[WARN]')}: ${this.messageStringifyer(message)}`,
        this.createContext(),
        subdomain,
      );
    } catch (error) {
      super.error(error);
    }
  }

  public error(message: unknown, subdomain?: string, trace?: string): void {
    try {
      super.error(
        `${chalk.bgRed('[ERROR]')}: ${this.messageStringifyer(message)}`,
        trace,
        this.createContext(),
      );

      const errorMessage = trace
        ? `${chalk.bgRed('[ERROR]')}: ${this.messageStringifyer(
            message,
          )}\nStack Trace:\n${trace}`
        : `${chalk.bgRed('[ERROR]')}: ${this.messageStringifyer(message)}`;
      this.logToFile(errorMessage, this.createContext(), subdomain);
    } catch (error) {
      super.error(error);
    }
  }
}
