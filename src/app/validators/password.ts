import { FormGroup } from '@angular/forms';
export function passwordCheck(pass: string, cpass: string) {
    return (formGroup: FormGroup) => {
        const password = formGroup.controls[pass];
        const cpassword = formGroup.controls[cpass];
        if (cpassword.errors && !cpassword.errors['mustMatch']) {
            return;
        }
        if (password.value !== cpassword.value) {
            cpassword.setErrors({ passwordCheck: true });
        } else {
            cpassword.setErrors(null);
        }
    };
}

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Don't validate empty value (required handles this)
    }

    const hasUppercase = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const isValid = hasUppercase && hasDigit && hasSpecialChar;

    return isValid ? null : { invalidPassword: true };
  };
}
