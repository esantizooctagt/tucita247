import { AbstractControl } from '@angular/forms';

export function GreaterThanValidator(control: AbstractControl): { [key: string]: boolean } | null { 
    const start = control.get('CustomerPerBooking');
    const end = control.get('CustomerPerTime');
    if (start.pristine || end.pristine){
        return null;
    }
    return start.value !== null && end.value !== null && Number(start.value) > Number(end.value)
      ? { 'greaterthan': true }
      : null;
}