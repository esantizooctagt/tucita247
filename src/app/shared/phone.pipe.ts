import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {

  transform(rawNum) {
    let newStr = "";
    // newStr = rawNum.charAt(0) != 0 ? "0" + rawNum : "" + rawNum;
    newStr = rawNum;
    if (newStr.length === 0) {
      newStr = '';
    } else if (newStr.length <= 3) {
      newStr = newStr.replace(/^(\d{0,3})/, '($1)');
    } else if (newStr.length <= 6) {
      newStr = newStr.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
    } else if (newStr.length <= 10) {
      newStr = newStr.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '+1 ($1) $2-$3');
    } else {
      newStr = newStr.replace(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,4})/, '+$1 ($2) $3-$4');
    }

    return newStr;
  }

}
