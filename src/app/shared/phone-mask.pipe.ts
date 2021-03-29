import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneMask'
})
export class PhoneMaskPipe implements PipeTransform {

  transform(rawNum, country) {
    let newStr = "";
    newStr = rawNum.replace(/\D/g, '');
    if (newStr.length === 0) {
      newStr = '';
    }
    if (country == 'PRI' || country == 'DOM' || country == 'USA'){
      if (newStr.length <= 3) {
        newStr = newStr.replace(/^(\d{0,3})/, '$1');
      } else if (newStr.length <= 6) {
        newStr = newStr.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
      } else if (newStr.length <= 10) {
        newStr = newStr.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
      } else if (newStr.length > 10) {
        newStr = newStr.replace(/\D/g, '').substring(0,10);
        newStr = newStr.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
      }
      return newStr;
    }
    if (country == 'GTM'){
      if (newStr.length <= 4) {
        newStr = newStr.replace(/^(\d{0,4})/, '$1');
      } else if (newStr.length <= 8) {
        newStr = newStr.replace(/^(\d{0,4})(\d{0,4})/, '$1-$2');
      } else if (newStr.length > 8) {
        newStr = newStr.replace(/\D/g, '').substring(0,8);
        newStr = newStr.replace(/^(\d{0,4})(\d{0,4})/, '$1-$2');
      }
      return newStr;
    }
    if (country == 'DEU'){
      if (newStr.length <= 3) {
        newStr = newStr.replace(/^(\d{0,3})/, '$1');
      } else if (newStr.length <= 11) {
        newStr = newStr.replace(/^(\d{0,3})(\d{0,8})/, '$1 $2');
      } else if (newStr.length > 11) {
        newStr = newStr.replace(/\D/g, '').substring(0,11);
        newStr = newStr.replace(/^(\d{0,3})(\d{0,8})/, '$1 $2');
      }
      return newStr;
    }
    if (country == 'ESP'){
      if (newStr.length <= 3) {
        newStr = newStr.replace(/^(\d{0,3})/, '$1');
      } else if (newStr.length <= 6) {
        newStr = newStr.replace(/^(\d{0,3})(\d{0,3})/, '$1 $2');
      } else if (newStr.length <= 9) {
        newStr = newStr.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})/, '$1 $2 $3');
      } else if (newStr.length > 9) {
        newStr = newStr.replace(/\D/g, '').substring(0,9);
        newStr = newStr.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})/, '$1 $2 $3');
      }
      return newStr;
    }
  }

}
