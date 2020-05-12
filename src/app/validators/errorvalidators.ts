
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Custom ErrorStateMatcher which returns true (error exists) when the parent form group is invalid and the control has been touched
 */
export class ConfirmValidParentMatcher implements ErrorStateMatcher {

    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        // console.log('Invalid :' + control.invalid + ' Dirty : ' + control.dirty + ' Touched: ' + control.touched + ' isSubmitted : ' + isSubmitted);
        return control && control.invalid && control.touched;
        // return control.parent.invalid && control.untouched;
        // return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
      }
}