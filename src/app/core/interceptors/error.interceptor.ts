import { HttpEvent, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 0) {
        return throwError(() => ({
          ...error,
          message: 'Unable to reach the server. Please check the API Gateway connection.',
        }));
      }
      return throwError(() => error);
    }),
  );
