import { Component, OnInit } from '@angular/core';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as XLSX from 'xlsx';
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import { AppointmentService, LocationService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

let chart02 = am4core.create("chartdiv02", am4charts.XYChart);
let chart03 = am4core.create("chartdiv03", am4charts.XYChart);
let chart04 = am4core.create("chartdiv04", am4charts.XYChart);
let chart05 = am4core.create("chartdiv05", am4charts.PieChart);
let chart06 = am4core.create("chartdiv06", am4charts.XYChart);
let chart = am4core.create("chartdiv01", am4charts.PieChart);

@Component({
  selector: 'app-maindash',
  templateUrl: './maindash.component.html',
  styleUrls: ['./maindash.component.scss']
})
export class MaindashComponent implements OnInit {
  businessId: string = '';
  locationId: string = '0';
  language: string = 'en';
  report01$: Observable<any>;
  locations$: Observable<any[]>;
  xAxis: any;
  endDate: any;
  initDate: any;
  dataExport: any;

  constructor(
    private locationService: LocationService,
    private appointmentService: AppointmentService,
    private spinnerService: SpinnerService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initDate = new Date();
    this.endDate = new Date();

    this.language = this.authService.language().toLowerCase();
    this.initDate.setDate(this.endDate.getDate()-7);
    
    const inDate = new Date(this.initDate);
    const finDate = new Date(this.endDate);
    
    let initD = inDate.getFullYear().toString() + '-' + (1+inDate.getMonth()).toString().padStart(2, '0') + '-' + inDate.getDate().toString().padStart(2, '0') + ' 00:00:00.000';
    let finD = finDate.getFullYear().toString() + '-' + (1+finDate.getMonth()).toString().padStart(2, '0') + '-' + finDate.getDate().toString().padStart(2, '0') + ' 23:59:59.000';

    this.businessId = this.authService.businessId();
    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadingdata:`);

    this.locations$ = this.locationService.getLocationsCode(this.businessId).pipe(
      map((res: any) => {
        return res.locs.sort((a, b) => (a.Name < b.Name ? -1 : 1));;
      }), 
      catchError(res =>{
        return res;
      })
    );

    this.report01$ = this.appointmentService.getDashboard(this.businessId, initD, finD).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            this.dataExport = res.Query; 
            this.loadResults(res.Query, '0');

            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    );
  }

  process(){
    const inDate = new Date(this.initDate);
    const finDate = new Date(this.endDate);
    
    let initD = inDate.getFullYear().toString() + '-' + (1+inDate.getMonth()).toString().padStart(2, '0') + '-' + inDate.getDate().toString().padStart(2, '0') + ' 00:00:00.000';
    let finD = finDate.getFullYear().toString() + '-' + (1+finDate.getMonth()).toString().padStart(2, '0') + '-' + finDate.getDate().toString().padStart(2, '0') + ' 23:59:59.000';
    this.businessId = this.authService.businessId();
    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadingdata:`);
    this.report01$ = this.appointmentService.getDashboard(this.businessId, initD, finD).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            this.dataExport = res.Query;
            this.loadResults(res.Query, this.locationId);
            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    );
  }

  loadResults(dataQuery: any, location: string){
    let query = dataQuery;
    if (location != '0'){
      query = query.filter(x => x.location == location);
    }
    let unique = [...new Set(query.map(item => item.service))];
    let data: any[]=[];
    for (let item of unique){
      let info = {
        service: item, 
        citas: query.filter(x => x.service == item).length, 
      }
      data.push(info);
    }
    this.loadCharts01(data);
    
    let unique02 = [...new Set(query.map(item => (this.language == 'en' ? item.en : item.es)))];
    let data02: any[]=[];
    for (let item of unique02){
      let info = {
        name: item,
        citas: query.filter(x => (this.language == 'en' ? x.en : x.es) == item).length
      }
      data02.push(info);
    }
    this.loadCharts02(data02);
    
    let unique03 = [...new Set(query.map(item => item.dateOpe))];
    let data03: any[]=[];
    for (let item of unique03){
      let uniq = [...new Set(query.map(item => item.location))];
      for (let loc of uniq){
        if (query.filter(x => x.dateOpe == item && x.location == loc).length > 0){
          let info = {
            dateOpe: item,
            location: loc, 
            citas: query.filter(x => x.dateOpe == item && x.location == loc).length
          }
          data03.push(info);
        } 
      }
    }
    this.loadCharts03(data03);

    var array = query,
      result = array.filter(function (a) {
        var key = a.dateOpe + '|' + a.location + '|' + a.service;
        if (!this[key]) {
            this[key] = true;
            return true;
        }
    }, Object.create(null));
    let data04: any[]=[];
    for (let item of result){
      data04.push({
        dateOpe: item.dateOpe,
        service: item.service,
        citas: query.filter(x => x.dateOpe == item.dateOpe && x.service == item.service).length
      });
    }
    this.loadCharts04(data04);

    let unique05 = [...new Set(query.map(item => item.provider))];
    let data05: any[]=[];
    for (let item of unique05){
      let info = {
        provider: item, 
        citas: query.filter(x => x.provider == item).length, 
      }
      data05.push(info);
    }
    this.loadCharts05(data05);

    var array = query,
      result = array.filter(function (a) {
        var key = a.dateOpe + '|' + a.location + '|' + a.provider;
        if (!this[key]) {
            this[key] = true;
            return true;
        }
    }, Object.create(null));
    let data06: any[]=[];
    for (let item of result){
      data06.push({
        dateOpe: item.dateOpe,
        provider: item.provider,
        citas: query.filter(x => x.dateOpe == item.dateOpe && x.provider == item.provider).length
      });
    }
    this.loadCharts06(data06);
  }

  loadCharts01(data){
    am4core.useTheme(am4themes_kelly);
    chart = am4core.create("chartdiv01", am4charts.PieChart);
    chart.data = data;

    // Add and configure Series
    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "citas";
    pieSeries.dataFields.category = "service";
    // pieSeries.tooltipText = "[bold]{category}: {value}";
    pieSeries.ticks.template.disabled = true;
    pieSeries.labels.template.disabled = true;
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    
    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";

    // This creates initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;
  }

  loadCharts05(data){
    am4core.useTheme(am4themes_kelly);
    chart05 = am4core.create("chartdiv05", am4charts.PieChart);
    chart05.data = data;

    // Add and configure Series
    let pieSeries = chart05.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "citas";
    pieSeries.dataFields.category = "provider";
    pieSeries.ticks.template.disabled = true;
    pieSeries.labels.template.disabled = true;
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    
    chart05.legend = new am4charts.Legend();
    chart05.legend.position = "right";

    // This creates initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;
  }

  loadCharts02(data){
    am4core.useTheme(am4themes_kelly);
    chart02 = am4core.create("chartdiv02", am4charts.XYChart);

    chart02.hiddenState.properties.opacity = 0;
    chart02.data = data;

    let categoryAxis = chart02.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "name";
    categoryAxis.renderer.minGridDistance = 40;
    categoryAxis.fontSize = 11;

    let valueAxis = chart02.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = Math.max.apply(Math, data.map(function(o) { return Number(o.citas); }));
    valueAxis.strictMinMax = true;
    valueAxis.renderer.minGridDistance = 30;

    let series = chart02.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "name";
    series.dataFields.valueY = "citas";
    series.columns.template.tooltipText = "[bold]{name}:[/][font-size:14px]{valueY.value}";
    series.columns.template.tooltipY = 0;
    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusTopRight = 10;
    series.columns.template.column.cornerRadiusTopLeft = 10;

    var bullet = series.bullets.push(new am4charts.LabelBullet())
    bullet.interactionsEnabled = false
    bullet.dy = 30;
    bullet.label.text = '{valueY}'
    bullet.label.fill = am4core.color('#ffffff')

    series.columns.template.adapter.add("fill", function(fill, target) {
      return chart02.colors.getIndex(target.dataItem.index);
    });
  }
  
  loadCharts03(result){
    let data: any[]=[];
    for (let item of result){
      let loc = item.location.replace(/[^a-zA-Z]/g, "");
      let locName = item.location;
      let res = {
        dateOpe: item.dateOpe, 
        [item.dateOpe]: +item.citas,
        location: locName 
      }
      data.push(res);
    }
    chart03 = am4core.create('chartdiv03', am4charts.XYChart)
    chart03.colors.step = 2;

    chart03.legend = new am4charts.Legend()
    chart03.legend.position = 'right'
    chart03.legend.paddingBottom = 20
    chart03.legend.labels.template.maxWidth = 95

    let xAxis = chart03.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'location'
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;

    let yAxis = chart03.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;

    chart03.data = data.sort((a, b) => a.dateOpe < b.dateOpe ? -1 : a.dateOpe > b.dateOpe ? 1 : 0);
    for (let item of [...new Set(data.map(item => item.dateOpe))]){
      this.createSeries03(chart03, item, item, xAxis);
    }
  }

  createSeries03(chart03, value, name, xAxis) {
    let series = chart03.series.push(new am4charts.ColumnSeries())
    series.dataFields.valueY = value
    series.dataFields.categoryX = 'location'
    series.name = name
    series.columns.template.column.tooltipText = "[bold]{categoryX}[/]\n[font-size:14px]{name}: {valueY}"; //"{valueY.value}";
    series.columns.template.column.tooltipY = 0;
    series.columns.template.column.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusTopLeft = 10;
    series.columns.template.column.cornerRadiusTopRight = 10;

    // series.events.on("hidden", this.arrangeColumns(chart03, xAxis));
    // series.events.on("shown", this.arrangeColumns(chart03, xAxis));

    let bullet = series.bullets.push(new am4charts.LabelBullet())
    bullet.interactionsEnabled = false
    bullet.dy = 30;
    bullet.label.text = '{valueY}'
    bullet.label.fill = am4core.color('#ffffff')

    return series;
  }

  arrangeColumns(chart03, xAxis) {
    let series = chart03.series.getIndex(0);

    let w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
    if (series.dataItems.length > 1) {
      let x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
      let x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
      let delta = ((x1 - x0) / chart03.series.length) * w;
      if (am4core.isNumber(delta)) {
        let middle = chart03.series.length / 2;

        let newIndex = 0;
        chart03.series.each(function(series) {
          if (!series.isHidden && !series.isHiding) {
              series.dummyData = newIndex;
              newIndex++;
          }
          else {
              series.dummyData = chart03.series.indexOf(series);
          }
        })
        let visibleCount = newIndex;
        let newMiddle = visibleCount / 2;

        chart03.series.each(function(series) {
            let trueIndex = chart03.series.indexOf(series);
            let newIndex = series.dummyData;

            let dx = (newIndex - trueIndex + middle - newMiddle) * delta

            series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
            series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
        })
      }
    }
  }

  loadCharts04(result){
    let data: any[]=[];
    let uniqueOpe = [...new Set(result.map(item => item.dateOpe))];
    for (let item of uniqueOpe){
      let res = {
        dateOpe: item
      }
      let dayRes = result.filter(x => x.dateOpe == item);
      for (let day of dayRes){
        let serv = day.service.replace(/[^a-zA-Z]/g, "");
        res[serv] = +day.citas
      }
      data.push(res);
    }

    let dataInfo: any[]=[];
    for (let item of result){
      let serv = item.service.replace(/[^a-zA-Z]/g, "");
      let servName = item.service;
      let res = {
        [serv]: +item.citas,
        service: servName 
      }
      dataInfo.push(res);
    }

    chart04 = am4core.create("chartdiv04", am4charts.XYChart);
    chart04.data = data.sort((a, b) => a.dateOpe < b.dateOpe ? -1 : a.dateOpe > b.dateOpe ? 1 : 0);;

    chart04.legend = new am4charts.Legend()
    chart04.legend.position = 'right'
    chart04.legend.paddingBottom = 20
    chart04.legend.labels.template.maxWidth = 95

    // Create axes
    let categoryAxis = chart04.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "dateOpe";
    categoryAxis.renderer.grid.template.location = 0;

    let valueAxis = chart04.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inside = true;
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.min = 0;

    let unique = [...new Set(dataInfo.map(item => item.service))];
    for (let item of unique){
      let serv = item.replace(/[^a-zA-Z]/g, "");
      this.createSeries(chart04, serv, item);
    }
  }

  createSeries(chart04, value, name) {
    // Set up series
    let series = chart04.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.valueY = value;
    series.dataFields.categoryX = "dateOpe";
    series.sequencedInterpolation = true;

    // Make it stacked
    series.stacked = true;
    
    // Configure columns
    series.columns.template.width = am4core.percent(60);
    series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";
    series.columns.template.tooltipY = 0;
    series.columns.template.strokeOpacity = 0;
    
    // Add label
    let labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY}";
    labelBullet.locationY = 0.5;
    labelBullet.label.hideOversized = true;
    
    return series;
  }

  loadCharts06(result){
    let data: any[]=[];
    let uniqueOpe = [...new Set(result.map(item => item.dateOpe))];
    for (let item of uniqueOpe){
      let res = {
        dateOpe: item
      }
      let dayRes = result.filter(x => x.dateOpe == item);
      for (let day of dayRes){
        let prov = day.provider.replace(/[^a-zA-Z]/g, "");
        res[prov] = +day.citas
      }
      data.push(res);
    }

    let dataInfo: any[]=[];
    for (let item of result){
      let prov = item.provider.replace(/[^a-zA-Z]/g, "");
      let provName = item.provider;
      let res = {
        [prov]: +item.citas,
        provider: provName 
      }
      dataInfo.push(res);
    }

    chart06 = am4core.create("chartdiv06", am4charts.XYChart);
    chart06.data = data.sort((a, b) => a.dateOpe < b.dateOpe ? -1 : a.dateOpe > b.dateOpe ? 1 : 0);;

    chart06.legend = new am4charts.Legend()
    chart06.legend.position = 'right'
    chart06.legend.paddingBottom = 20
    chart06.legend.labels.template.maxWidth = 95

    // Create axes
    let categoryAxis = chart06.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "dateOpe";
    categoryAxis.renderer.grid.template.location = 0;

    let valueAxis = chart06.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inside = true;
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.min = 0;

    let unique = [...new Set(dataInfo.map(item => item.provider))];
    for (let item of unique){
      let prov = item.replace(/[^a-zA-Z]/g, "");
      this.createSeries06(chart06, prov, item);
    }
  }

  createSeries06(chart06, value, name) {
    // Set up series
    let series = chart06.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.valueY = value;
    series.dataFields.categoryX = "dateOpe";
    series.sequencedInterpolation = true;

    // Make it stacked
    series.stacked = true;
    
    // Configure columns
    series.columns.template.width = am4core.percent(60);
    series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";
    series.columns.template.tooltipY = 0;
    series.columns.template.strokeOpacity = 0;
    
    // Add label
    let labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY}";
    labelBullet.locationY = 0.5;
    labelBullet.label.hideOversized = true;
    
    return series;
  }

  onLocationChange(event){
    this.locationId = event.value;
  }

  exportExcel(){
    const ws: XLSX.WorkSheet=XLSX.utils.json_to_sheet(this.dataExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, 'tucita247.xlsx');
  }
}
