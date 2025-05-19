import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoginService} from '../services/login.service';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const loaderService = inject(LoginService);
  const token = localStorage.getItem('access_token');

  loaderService.showLoader(); // Show loader immediately

  let authReq = req;
  if (token) {
      authReq = req.clone({
          setHeaders: {
              Authorization: `Bearer ${token}`
          }
      });
  }

  const excludedUrls = [
      '/login/',
      '/password/forgot'
  ];

  const isExcluded = excludedUrls.some(url => req.url.includes(url));

  if (isExcluded) {
      return next(req).pipe( // Continue with the original request, without token
        catchError((error: HttpErrorResponse) => {
          console.error(`HTTP Error: ${error.status} - ${error.message}`);

          if (error.status === 401) {
            console.error('Unauthorized request - Redirecting to login');
            localStorage.removeItem('access_token');
            router.navigate(['/login']);
          }

          return throwError(() => error);
        }),
        finalize(() => {
          loaderService.hideLoader();
        })
      );
  }

  // return next(authReq).pipe( 
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
          console.error(`HTTP Error: ${error.status} - ${error.message}`);

          if (error.status === 401) {
              console.error('Unauthorized request - Redirecting to login');
              localStorage.removeItem('access_token');
              router.navigate(['/login']);
          }

          return throwError(() => error);
      }),
      finalize(() => {
          loaderService.hideLoader();
      })
  );
};
