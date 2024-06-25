import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';
import { LoggerService } from '../logger/logger.service';

const logger = new LoggerService();

function handleError(error: unknown): HttpException {
    if (error instanceof HttpException) {
        throw error;
    }

    if (error instanceof AxiosError) {
        throw new HttpException(
            error.message,
            error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    if (error instanceof Error) {
        throw new HttpException(
            error.message,
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    throw new HttpException(
        'Unexpected error',
        HttpStatus.INTERNAL_SERVER_ERROR
    );
}

function catchError(
    error: unknown,
    context: string,
    logEntityId?: string
): void {
    logger.error(error, context, logEntityId);
    handleError(error);
}
function getFunctionParamsList(func: unknown): string[] {
    return (func?.toString()?.match(/\([a-zA-Z\d_,{} ]*\)/g)?.[0] || '')
        .replaceAll(/[\(\)]/g, '')
        .split(',')
        .map((param) => param.trim());
}

function findParamIndex(func: unknown, paramName: string | undefined): number {
    if (!paramName) {
        return -1;
    }

    const pramsList = getFunctionParamsList(func);

    return pramsList.findIndex((parmName) => parmName === paramName);
}

function getParamValue(params: unknown[], index: number): unknown | undefined {
    if (index === -1) {
        return undefined;
    }

    return params[index] || undefined;
}

function deepFind(
    value: unknown | undefined,
    path: string[]
): undefined | string {
    if (!value) {
        return undefined;
    }

    let foundIdValue = value;

    if (path.length) {
        for (const keyName of path) {
            if (foundIdValue === undefined) {
                break;
            }

            foundIdValue = foundIdValue?.[keyName];
        }
    }

    return foundIdValue ? foundIdValue?.toString() : undefined;
}

export function ErrorHandler(idKeyName?: string): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        const propertyName = propertyKey.toString();
        const logContext = `${target.constructor.name}/${propertyName}`;

        const [paramName, ...idPath] = idKeyName?.split('.') || [];
        const idParamIndex = findParamIndex(originalMethod, paramName);

        if (originalMethod.constructor.name === 'AsyncFunction') {
            descriptor.value = {
                [propertyName]: async function (
                    ...args: unknown[]
                ): Promise<unknown> {
                    const paramValue = getParamValue(args, idParamIndex);
                    const idValue = deepFind(paramValue, idPath);

                    try {
                        return await originalMethod.apply(this, args);
                    } catch (error) {
                        catchError(error, logContext, idValue);
                    }
                },
            }[propertyName];
        } else {
            descriptor.value = {
                [propertyName]: function (...args: unknown[]): unknown {
                    const paramValue = getParamValue(args, idParamIndex);
                    const idValue = deepFind(paramValue, idPath);

                    try {
                        return originalMethod.apply(this, args);
                    } catch (error) {
                        catchError(error, logContext, idValue);
                    }
                },
            }[propertyName];
        }
    };
}
