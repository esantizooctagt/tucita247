import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
@Directive({
  selector: '[formControlName][appPhoneMask]'
})
export class PhoneMaskDirective {
  @Input() ccode:FormControl;

  constructor(
    public ngControl: NgControl,
    private el: ElementRef) { }

  @HostListener('input',['$event']) onEvent($event){
    let valueToTransform = this.el.nativeElement.value;
    this.ngControl.control.setValue(valueToTransform);
  }

  @HostListener('ngModelChange', ['$event'])
  onModelChange(event) {
    this.onInputChange(event, false);
  }

  @HostListener('keydown.backspace', ['$event'])
  keydownBackspace(event) {
    this.onInputChange(event.target.value, true);
  }

  onInputChange(event, backspace) {
    let code = this.ccode.value;
    let newVal = event.replace(/\D/g, '');
    if (code == 'PRI' || code == 'DOM' || code == 'USA'){
      if (backspace && newVal.length <= 6) {
        newVal = newVal.substring(0, newVal.length - 1);
      }
      if (newVal.length === 0) {
        newVal = '';
      } else if (newVal.length <= 3) {
        newVal = newVal.replace(/^(\d{0,3})/, '($1)');
      } else if (newVal.length <= 6) {
        newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
      } else if (newVal.length <= 10) {
        newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
      } else if (newVal.length > 10) {
        newVal = newVal.replace(/\D/g, '').substring(0,10);
        newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
      }
      this.ngControl.valueAccessor.writeValue(newVal);
    }
    if (code == 'GTM'){
      if (newVal.length === 0) {
        newVal = '';
      } else if (newVal.length <= 4) {
        newVal = newVal.replace(/^(\d{0,4})/, '$1');
      } else if (newVal.length <= 8) {
        newVal = newVal.replace(/^(\d{0,4})(\d{0,4})/, '$1-$2');
      } else if (newVal.length > 8){
        newVal = newVal.replace(/\D/g, '').substring(0,8);
        newVal = newVal.replace(/^(\d{0,4})(\d{0,4})/, '$1-$2');
      }
      this.ngControl.valueAccessor.writeValue(newVal);
    }
    if (code == 'DEU'){
      if (newVal.length === 0) {
        newVal = '';
      } else if (newVal.length <= 3) {
        newVal = newVal.replace(/^(\d{0,3})/, '$1');
      } else if (newVal.length <= 11) {
        newVal = newVal.replace(/^(\d{0,3})(\d{0,8})/, '$1 $2');
      } else if (newVal.length > 11){
        newVal = newVal.replace(/\D/g, '').substring(0,11);
        newVal = newVal.replace(/^(\d{0,3})(\d{0,8})/, '$1 $2');
      }
      this.ngControl.valueAccessor.writeValue(newVal);
    }
    if (code == 'ESP'){
      if (newVal.length === 0) {
        newVal = '';
      } else if (newVal.length <= 3) {
        newVal = newVal.replace(/^(\d{0,3})/, '$1');
      } else if (newVal.length <= 6) {
        newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '$1 $2');
      } else if (newVal.length <= 9) {
        newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})/, '$1 $2 $3');
      } else if (newVal.length > 9){
        newVal = newVal.replace(/\D/g, '').substring(0,9);
        newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})/, '$1 $2 $3');
      }
      this.ngControl.valueAccessor.writeValue(newVal);
    }
  }

}
