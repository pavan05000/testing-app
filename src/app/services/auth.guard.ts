import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',  // Ensure the guard is provided in the root injector
})
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      this.router.navigate(['/login']);
      return false;
    }

    // Get the roles from localStorage
    const roles = localStorage.getItem('Roles')?.split(",").map(role => role.toUpperCase()) || [];

const requiredRoles = route.data['roles'] as Array<string>;

// Convert all required roles to uppercase as well
const uppercaseRequiredRoles = requiredRoles.map(role => role.toUpperCase());

if (uppercaseRequiredRoles && uppercaseRequiredRoles.length > 0) {
  const hasRole = uppercaseRequiredRoles.some(role => roles.includes(role));

  if (!hasRole) {
    this.router.navigate(['/access-denied']);
    return false;
  }
}
return true;
  }
}
