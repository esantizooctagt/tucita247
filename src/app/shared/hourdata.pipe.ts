import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hourdata'
})
export class HourdataPipe implements PipeTransform {

  transform(day: any[], time: string): any {
    let res;
    let result = {
      Available: 0,
      Bucket: 0
    };
    res = day.filter(val => val.Time == time);
    if (res.length > 0 && res != undefined){
      result = res[0];
    }
    return result;
  }

}
