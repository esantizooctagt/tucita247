import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'serviceData'
})
export class ServiceDataPipe implements PipeTransform {

  transform(day: any[], services: any[], time24: string, updated: any): any {
    let data: string = '';
    let serviceId: string ='';
    let res = day.filter(val => val.Time == time24);
    if (res.length > 0 && res != undefined){
      serviceId = res[0].ServiceId;
    }
    if (serviceId != ''){
      let result = services.filter(x=>x.ServiceId == serviceId);
      if (result.length > 0 && result != undefined) {
        data = result[0].Name;
      }
    }
    return data;
  }

}
