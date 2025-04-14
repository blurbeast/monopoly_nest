import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default status and message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle specific exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (exception.getResponse() as any).message || exception.message;
    } else if (
      exception instanceof TypeError &&
      exception.message.includes('undefined')
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid input: empty argument is passed';
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error for debugging (optional, replace with a logger in production)
    // console.error(`Error occurred: ${exception}`);

    // Send standardized error response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
