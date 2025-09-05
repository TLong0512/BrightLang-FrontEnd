import { HttpInterceptorFn } from "@angular/common/http";

export const credentialInterceptor: HttpInterceptorFn = (req, next) => {
  const request = req.clone({
    withCredentials: true
  });
  return next(request);
};