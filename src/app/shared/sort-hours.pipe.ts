import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortHours'
})
export class SortHoursPipe implements PipeTransform {

  transform(data: any[]): any {
    return data.sort((a, b) => a.Time24 - b.Time24);
  }

}
