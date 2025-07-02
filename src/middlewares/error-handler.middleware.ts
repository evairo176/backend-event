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
    errors: errors,
  });
};

export const errorHandler: ErrorRequestHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(`Error occurred on PATH: ${req?.path}`, error);

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
    await db.errorLog.create({
      data: {
        message: 'Validation failed',
        stack: JSON.stringify(error.issues),
        method: req.method,
        path: req.originalUrl,
        statusCode: HTTPSTATUS.BAD_REQUEST,
      },
    });
    return formatZodError(res, error);
  }

  // Custom App error
  if (error instanceof AppError) {
    await db.errorLog.create({
      data: {
        message: error.message,
        stack: error.stack,
        method: req.method,
        path: req.originalUrl,
        statusCode: error.statusCode,
        code: error.errorCode,
      },
    });
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  // Prisma: Unique constraint failed
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : String(error.meta?.target);

      await db.errorLog.create({
        data: {
          message: `Duplicate field: ${fields}`,
          stack: error.stack,
          method: req.method,
          path: req.originalUrl,
          statusCode: HTTPSTATUS.CONFLICT,
          code: error.code,
          meta: JSON.stringify(error.meta),
        },
      });

      return res.status(HTTPSTATUS.CONFLICT).json({
        message: `Duplicate field: ${Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : String(error.meta?.target)}`,
        code: error.code,
      });
    }

    // Example: Record not found
    if (error.code === 'P2025') {
      await db.errorLog.create({
        data: {
          message: JSON.stringify(error.meta?.cause) || `Record not found`,
          stack: error.stack,
          method: req.method,
          path: req.originalUrl,
          statusCode: HTTPSTATUS.NOT_FOUND,
          code: error.code,
          meta: JSON.stringify(error.meta),
        },
      });

      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: error.meta?.cause || 'Record not found',
        code: error.code,
      });
    }

    await db.errorLog.create({
      data: {
        message: 'Prisma known error',
        stack: error.stack,
        method: req.method,
        path: req.originalUrl,
        statusCode: HTTPSTATUS.BAD_REQUEST,
        code: error.code,
        meta: JSON.stringify(error.meta),
      },
    });

    // Default Prisma known request error
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: 'Prisma known error',
      code: error.code,
      meta: error.meta,
    });
  }

  // Prisma: Validation (e.g. wrong input type)
  if (error instanceof Prisma.PrismaClientValidationError) {
    await db.errorLog.create({
      data: {
        message: 'Invalid input data. Prisma validation failed.',
        stack: error.stack,
        method: req.method,
        path: req.originalUrl,
        statusCode: HTTPSTATUS.BAD_REQUEST,
      },
    });
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: 'Invalid input data. Prisma validation failed.',
      error: error.message,
    });
  }

  // Prisma: Unknown client error
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    await db.errorLog.create({
      data: {
        message: 'An unknown error occurred in the database operation.',
        stack: error.stack,
        method: req.method,
        path: req.originalUrl,
        statusCode: HTTPSTATUS.INTERNAL_SERVER_ERROR,
        meta: error.message,
      },
    });
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'An unknown error occurred in the database operation.',
      error: error.message,
    });
  }

  // Prisma: Initialization issues
  if (error instanceof Prisma.PrismaClientInitializationError) {
    await db.errorLog.create({
      data: {
        message: 'Prisma client failed to initialize.',
        stack: error.stack,
        method: req.method,
        path: req.originalUrl,
        statusCode: HTTPSTATUS.INTERNAL_SERVER_ERROR,
        meta: error.message,
      },
    });
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Prisma client failed to initialize.',
      error: error.message,
    });
  }

  await db.errorLog.create({
    data: {
      message: 'Internal Server Error',
      stack: error.stack,
      method: req.method,
      path: req.originalUrl,
      statusCode: HTTPSTATUS.INTERNAL_SERVER_ERROR,
      meta: error?.message || 'Unknown error occurred',
    },
  });
  // Fallback internal error
  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: 'Internal Server Error',
    error: error?.message || 'Unknown error occurred',
  });
};
