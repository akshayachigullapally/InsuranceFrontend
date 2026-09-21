import { HttpEvent, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (
  req,
  next,
): Observable<HttpEvent<unknown>> =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          return throwError(() => ({
            ...error,
            message: 'Unable to reach the server. Please check the API Gateway connection.',
          }));
        }
        const body = error.error;
        const message = body?.message ?? body?.messages?.join(', ') ?? error.message;
        return throwError(() => new HttpErrorResponse({
          error: body,
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url ?? undefined,
        }));
      }
      return throwError(() => error);
    }),
  );