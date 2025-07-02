import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { HTTPSTATUS } from '../config/http.config';
import { AppError } from '../cummon/utils/app-error';
import { z } from 'zod';
import {
  clearAuthenticationCookies,
  REFRESH_PATH,
} from '../cummon/utils/cookies';
import { Prisma } from '@prisma/client';
import { db } from '../database/database';

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: 'Validation failed',
    errors,
  });
};

const logError = async ({
  message,
  stack,
  req,
  statusCode,
  code,
  meta,
}: {
  message: string;
  stack: any;
  req: Request;
  statusCode: number;
  code?: string;
  meta?: any;
}) => {
  try {
    await db.errorLog.create({
      data: {
        message,
        stack: typeof stack === 'string' ? stack : JSON.stringify(stack),
        method: req.method,
        path: req.originalUrl,
        statusCode,
        code,
        meta: meta ? JSON.stringify(meta) : undefined,
      },
    });
  } catch (logError) {
    console.error('Gagal menyimpan log error ke database:', logError);
  }
};

export const errorHandler: ErrorRequestHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(`Error occurred on PATH: ${req.path}`, error);

  if (req.path === REFRESH_PATH) {
    clearAuthenticationCookies(res);
  }

  // JSON syntax error
  if (error instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: 'Invalid JSON format, Please check your request body',
    });
  }

  // Zod validation error
  if (error instanceof z.ZodError) {
    await logError({
      message: 'Validation failed',
      stack: error.issues,
      req,
      statusCode: HTTPSTATUS.BAD_REQUEST,
    });
    return formatZodError(res, error);
  }

  // Custom AppError
  if (error instanceof AppError) {
    await logError({
      message: error.message,
      stack: error.stack,
      req,
      statusCode: error.statusCode,
      code: error.errorCode,
    });
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  // Prisma Known Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let statusCode = HTTPSTATUS.BAD_REQUEST;
    let message = 'Prisma known error';

    if (error.code === 'P2002') {
      message = `Duplicate field: ${
        Array.isArray(error.meta?.target)
          ? error.meta.target.join(', ')
          : String(error.meta?.target)
      }`;
      statusCode = HTTPSTATUS.CONFLICT;
    } else if (error.code === 'P2025') {
      message = JSON.stringify(error.meta?.cause) || 'Record not found';
      statusCode = HTTPSTATUS.NOT_FOUND;
    }

    await logError({
      message,
      stack: error.stack,
      req,
      statusCode,
      code: error.code,
      meta: error.meta,
    });

    return res.status(statusCode).json({
      message,
      code: error.code,
      meta: error.meta,
    });
  }

  // Prisma Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    const message = 'Invalid input data. Prisma validation failed.';
    await logError({
      message,
      stack: error.stack,
      req,
      statusCode: HTTPSTATUS.BAD_REQUEST,
    });
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message,
      error: error.message,
    });
  }

  // Prisma Unknown Error
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    const message = 'An unknown error occurred in the database operation.';
    await logError({
      message,
      stack: error.stack,
      req,
      statusCode: HTTPSTATUS.INTERNAL_SERVER_ERROR,
      meta: error.message,
    });
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message,
      error: error.message,
    });
  }

  // Prisma Initialization Error
  if (error instanceof Prisma.PrismaClientInitializationError) {
    const message = 'Prisma client failed to initialize.';
    await logError({
      message,
      stack: error.stack,
      req,
      statusCode: HTTPSTATUS.INTERNAL_SERVER_ERROR,
      meta: error.message,
    });
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message,
      error: error.message,
    });
  }

  // Fallback: Unknown error
  const fallbackMessage = error?.message || 'Unknown error occurred';
  await logError({
    message: 'Internal Server Error',
    stack: error.stack,
    req,
    statusCode: HTTPSTATUS.INTERNAL_SERVER_ERROR,
    meta: fallbackMessage,
  });

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: 'Internal Server Error',
    error: fallbackMessage,
  });
};
