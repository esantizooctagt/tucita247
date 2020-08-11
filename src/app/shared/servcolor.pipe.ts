import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'servcolor'
})
export class ServcolorPipe implements PipeTransform {

  transform(day: any[], time: string, services: any[]): string {
    let res;
    let result: string = '';
    res = day.filter(val => val.Time == time);
    if (res.length > 0 && res != undefined){
      let servId = res[0].ServiceId;
      let color = services.filter(val => val.ServiceId == servId);
      if (color.length > 0 && color != undefined){
        result = color[0].Color;
      }
    }
    return result;
  }

}
