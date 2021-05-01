import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'namecode'
})
export class NamecodePipe implements PipeTransform {

  transform(key: string, type: number, data: any[]): string {
    let result;
    let name = '';
    if (type == 1){
      result = data.filter(x => x.LocationId == key);
    }
    if (type == 2){
      result = data.filter(x => x.ProviderId == key);
    }
    if (type == 3){
      result = data.filter(x => x.ServiceId == key);
    }
    if (result.length > 0){
      name = result[0].Name;
    }
    
    return name;
  }

}
