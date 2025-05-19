import { Component, inject, signal, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api'
import { ActivatedRouterService } from 'src/app/services/activated-router-service';
import { LoginService } from 'src/app/services/login.service';
import { CommonModule } from '@angular/common';
import { NoSpaceDirective} from 'src/app/directives/no-space.directive';


@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink, ToastModule,NoSpaceDirective],
  standalone:true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
    remainingTime: number = 60; // Timer duration in seconds
    min:string | number='01';
    sec:string | number='00';
    isResendDisabled: boolean = true; // Disable the resend button initially
    isLoginbtnDisable:boolean=false;
    private timerInterval: any; // Holds the interval reference
    otpText:boolean=true;
    validateOtp: string | null = null; 
    apiErrors: { [key: string]: string } = {};
    loginErrorMessage:string='';
    @ViewChild('usernameField') usernameField!: ElementRef;
    @ViewChild('passwordField') passwordField!: ElementRef;
  
    
    constructor(
      private formBuilder: FormBuilder,
      private messageService: MessageService,
      private loginService: LoginService,
      private activatedRouterService: ActivatedRouterService)
      {}
  
    showPassword:boolean = false;
    enableOTPField:boolean = false;
    loginForm!: FormGroup;
    router = inject(Router)
  
    ngOnInit(): void {
      this.loginForm = this.formBuilder.group({
      username: new FormControl('', [Validators.required, Validators.minLength(6),Validators.maxLength(100), Validators.email]),
      password: new FormControl('', [Validators.required,Validators.minLength(6),Validators.maxLength(16)]),
      otp: new FormControl('', [Validators.required]), 
    })
    }
  
    clearError(){
      this.apiErrors['errMsg']='';
      this.apiErrors['username']='';
      this.apiErrors['password']='';
      this.loginErrorMessage = '';
    }
  
    togglePasswordVisibility(){
      this.showPassword= !this.showPassword
    }
    preventPaste(event:any) {
      event.preventDefault();
    }
  
    getFormControl(formControlName:string) {
      return this.loginForm.get(formControlName);
    }
  
    getFormValidation() {
      return this.loginForm.controls['username'].status === 'VALID' && this.loginForm.controls['password'].status === 'VALID'
    }
  
    startTimer(timeRemains:number): void {
      let timeLeft = 60; // Total time in seconds for 1 minute
      this.isResendDisabled = true; 
      this.timerInterval = setInterval(() => {
        this.otpText=true;
        var m = Math.floor(timeRemains / 60);
        var s = timeRemains % 60;
        this.min  = m < 10 ? '0' + m : m;
        this.sec = s < 10 ? '0' + s : s;
        if (timeRemains <= 0) {
          clearInterval(this.timerInterval); // Stop the timer
          this.isResendDisabled = false; // Enable the Resend OTP button
          this.otpText=false
          this.validateOtp='';
        }
        timeRemains--;
      }, 1000);
    }
  
    validateOTP(event:any, type:any) {
      let inputValue = event.target.value.trim();   
      // Remove non-numeric characters
      let numericValue = inputValue.replace(/\D/g, ''); 
      if(type ==='otp'){
        if (numericValue.length > 6) {
            numericValue = numericValue.slice(0, 6);
        }
      }
      event.target.value = numericValue;
    }
  
    otp() {
      this.isResendDisabled=true
      this.onLogin(true)
    }
  
    focusErrorFields() {
      if (this.apiErrors['errMsg']) {
        this.usernameField.nativeElement.focus();
        // setTimeout(() => {
          this.passwordField.nativeElement.focus();
        // }, 100); // Add slight delay to focus both fields sequentially
        return;
      }  
      if (this.apiErrors['username']) {
        this.usernameField.nativeElement.focus();
      }
      if (this.apiErrors['password']) {
        this.passwordField.nativeElement.focus();
      }
    }
  
    resendOtp(): void {
      this.apiErrors = {}; // Clear error object to reset the error state
      // Request to resend OTP
      const obj = {
        email: this.loginForm.controls['username'].value
      };
    
      this.loginService.resendOtpToMail(obj).subscribe(
        (res: any) => {
        //  console.log("OTP resent:", res.otp);
          this.validateOtp = res.otp; // Set the validateOtp value
          this.getFormControl('otp')?.reset(); 
          this.messageService.add({
            severity: 'success',
            summary: '',
            detail: 'Please enter OTP sent to your registered email'
          });  
          this.startTimer(60);  // Restart the countdown timer
        },
        (err: any) => {
          this.getFormControl('otp')?.reset(); 
          // Handle error from API and update the error messages
          this.activatedRouterService.updateError(err, this.messageService);
        }
      );
    }
    
  sendOtp(): void {
    this.isLoginbtnDisable=true;
    const obj = {
      email: this.loginForm.controls['username'].value
    };
    this.loginService.sendOtpToMail(obj).subscribe(
      (res: any) => {
        // this.loginService.showLoader();
        // console.log("OTP sent:", res.otp);
        this.validateOtp = res.otp;  // Convert OTP to number
        this.startTimer(60);
        this.enableOTPField = true;
        this.isResendDisabled = true;
        this.messageService.add({ severity: 'success', summary: '', detail: 'Please enter OTP sent to your registered email' });     
      },
      (err: any) => {
        this.isLoginbtnDisable=false;
        this.loginService.hideLoader();
        this.activatedRouterService.updateError(err, this.messageService);
      }
    );
  }
  
  loginApi(){
    const loginObj = {
      email: this.loginForm.controls['username'].value,
      password: this.loginForm.controls['password'].value,
      otp:this.validateOtp
    }
    this.loginService.userLogin(loginObj).subscribe(res => {     
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Logging in. Please wait...'
      }); 
      // Navigate to the desired route
      this.navigateToRoleBasedRoute(res.roles);
      // this.router.navigate(['/um/maintain_users']);
    },(err: any) => {
      if (err.error.error) {
        let msg = err.error.error;
        if(msg === "Invalid Email Format.") {
          this.apiErrors['username'] = msg;
        } else if (msg === "Password must contain at least one special character and one digit.") {
          this.apiErrors['password'] = msg;
        } else if (msg === "Invalid credentials.") {
          this.apiErrors['errMsg'] = msg;
        }
        else if (msg === "Invalid email or password") {
          this.apiErrors['errMsg'] = msg;
        }
        else {
          if (err && err.status === 401) { 
            this.messageService.add({
              severity: 'error',
              summary: 'Unauthorized',
              detail: 'You are not authorized to perform this action. Please log in again.'
            });
          } else if (err && err.status === 400) { 
            this.messageService.add({
              severity: 'error',
              summary: 'Bad Request',
              detail: 'Please enter a valid OTP'
            });
          } else { 
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'An unexpected error occurred. Please try again or contact Roboxa-IT Service.'
            });
          }
        }
      }
       else if(err.error.email instanceof Array) 
        {
        let errMessages = err.error.email;
        errMessages.forEach((msg:string) => {
          if(msg === "Enter a valid email address.") {
            this.apiErrors['username']  = msg;
          } else if (msg === "Password must contain at least one special character and one digit.") {
            this.apiErrors['password'] = msg;
          }
        })  
        }
      this.focusErrorFields(); 
    }
  )
  }
  
    onLogin(isResend:boolean) {
      this.apiErrors = {}; // Reset API errors    
      this.messageService.clear();
      this.loginService.showLoader();
      const obj = {
        email: this.loginForm.controls['username'].value,
        password:this.loginForm.controls['password'].value
      };
      this.loginService.loginJWTToken(obj).subscribe(        
        (res: any) => {
          if(res.message=="User is Valid"){
            setTimeout(() => {
              this.sendOtp();  
            },50)
          }
        },
        (err: any) => {
         this.loginService.hideLoader();
         console.log(err) 
          this.loginErrorMessage=err?.error?.error?.[0] || err?.error?.non_field_errors || err?.error?.email?.[0]; 
          // this.getFormControl('password')?.reset();
        }
      );
      // if(this.loginForm.controls['username'].value === '' || this.loginForm.controls['username'].value === undefined || this.loginForm.controls['username'].value === null){
      //   this.messageService.add({ severity: 'error', summary: '', detail: 'Please enter email' });
      // } else if(this.loginForm.controls['password'].value === '' || this.loginForm.controls['password'].value === undefined || this.loginForm.controls['password'].value === null){
      //   this.messageService.add({ severity: 'error', summary: '', detail: 'Please enter password' });
      // } 
    }
  
    onSubmit(): void {
      this.messageService.clear();
      const email = this.loginForm.controls['username'].value;
      const otp = this.loginForm.controls['otp'].value;
  
    // Check if OTP is empty or invalid
    if (!otp || otp.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Please enter a valid OTP'
      });
      return; 
    }
  
    if (this.validateOtp === null || this.validateOtp === undefined) {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'OTP validation error: OTP is not set properly.'
      });
      return; 
    }
  
    // Validate OTP
    if (otp == this.validateOtp) { 
      this.loginApi();
      //console.log("Login success... OTP validated");   
    } else {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Invalid OTP. Please try again.'
      });
    }
      }
      navigateToRoleBasedRoute(roles: string[]): void {
        // Retrieve roles from localStorage if needed
        const storedRoles = localStorage.getItem('Roles');
       // const roleArray = storedRoles ? storedRoles.split(',').map(role => role.toUpperCase()) : [];
       const roleArray = storedRoles 
       ? storedRoles.split(',').map(role => role.trim().toUpperCase().replace(/\s+/g, '')) 
       : [];
       
        // Convert the role conditions to uppercase for case-insensitive comparison
        if (roleArray.includes('USERADMIN')) {
          this.router.navigate(['/um/maintain_users']);
        } else if (roleArray.includes('DATAADMIN')) {
          this.router.navigate(['/md/project_tasks']);
        } else if (roleArray.includes('PMO')) {
          this.router.navigate(['/pmo/project-assignment']);
        } else if (roleArray.includes('MANAGER')) {
          this.router.navigate(['/manager/approval']);
        } else if (roleArray.includes('EMPLOYEE')) {
          this.router.navigate(['/emp/emp-dashboard']);
        }  else if (roleArray.includes('HR')) {
          this.router.navigate(['/hr/employees']);
        }  else if (roleArray.includes('DELIVERYHEAD')) {
          this.router.navigate(['/dh/dh-approval']);
        } else if (roleArray.includes('MANAGEMENT')) {
          this.router.navigate(['/mgmnt/mnt-approval']);
        } else {
          this.router.navigate(['/access-denied']);
        }
      }
      

    }
