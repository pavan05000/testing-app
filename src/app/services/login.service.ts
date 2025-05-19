import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environment';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly url=environment.apiUrl; 
  private loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  private isAuthenticated = false;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http:HttpClient,private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  showLoader(): void {
    this.loading.next(true);
  }

  hideLoader(): void {
    this.loading.next(false);
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  loginJWTToken(obj:any): Observable<any> {
      return this.http.post(this.url+'login/jwt-token/',obj)
  }

  userLogin(loginObj: any): Observable<any> {
    // this.showLoader();
    return this.http.post(this.url+'login/login/', loginObj).pipe(
      tap((res: any) => {
        if (res) {
          // this.hideLoader();
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('Roles',res.roles && res.roles[0] ? res.roles[0].join(",") : "");
          localStorage.setItem('user_name',res.user_name);
          localStorage.setItem('designation',res.designation);
          const loggedUserDetails=this.decodeJWT(res.access_token);
           localStorage.setItem("userId",loggedUserDetails.payload?.user_id);
          this.currentUserSubject.next(res);
        }
      }),
      catchError((error) => {
        // this.hideLoader();
        throw error;
      })
    );
  }
  
  sendOtpToMail(obj:any): Observable<any> {
    return this.http.post(this.url+'login/send-otp/',obj)
  }

  resendOtpToMail(obj:any){
    return this.http.post(this.url+'login/send-otp/',obj)
  }

  forgotPassword(obj:any): Observable<any> {
    return this.http.post(this.url+"/login/forgot-password/", obj)
  }
  getDropdownData(): Observable<any> {
    return this.http.get<any>('assets/dropdown-data.json');
  }

  logout() {
    localStorage.removeItem('Roles');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
     localStorage.removeItem("userId");
     localStorage.removeItem("designation");
    localStorage.clear();
    this.router.navigate(['/login']);
    this.currentUserSubject.next(null);
  }

  decodeJWT(token:string) {
    // Split the JWT token into its three parts (Header, Payload, Signature)
    const [header, payload, signature] = token.split('.');
  
    // Decode base64url encoded parts
    const decodedHeader = JSON.parse(atob(header.replace(/-/g, '+').replace(/_/g, '/')));
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  
    return {
      header: decodedHeader,
      payload: decodedPayload,
      signature: signature
    };
  }
}
