import { ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { FormControl } from '@angular/forms';

export interface ValidationResult {
    [key: string]: boolean;
}

export class PasswordValidators {

    public static strong(control: FormControl): ValidationResult {
        let hasNumber = /\d/.test(control.value);
        let hasUpper = /[A-Z]/.test(control.value);
        let hasLower = /[a-z]/.test(control.value);

        const valid = hasNumber && hasUpper && hasLower;
        if (!valid) {
            return { strong: true };
        }
        return null;
    }
}