import { Component, OnInit } from '@angular/core';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { AppointmentService, LocationService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

let chart02 = am4core.create("chartdiv02", am4charts.XYChart);
let chart03 = am4core.create("chartdiv03", am4charts.XYChart);
let chart04 = am4core.create("chartdiv03", am4charts.XYChart);
let chart = am4core.create("chartdiv01", am4charts.PieChart);

@Component({
  selector: 'app-maindash',
  templateUrl: './maindash.component.html',
  styleUrls: ['./maindash.component.scss']
})
export class MaindashComponent implements OnInit {
  businessId: string = '';
  locationId: string = '_';
  report01$: Observable<any>;
  report02$: Observable<any>;
  report03$: Observable<any>;
  report04$: Observable<any>;
  locations$: Observable<any[]>;
  xAxis: any;
  endDate: any;
  initDate: any;

  constructor(
    private locationService: LocationService,
    private appointmentService: AppointmentService,
    private spinnerService: SpinnerService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initDate = new Date();
    this.endDate = new Date();
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

    this.report01$ = this.appointmentService.getDashboard(this.businessId, this.locationId, initD, finD, 1).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            this.loadCharts01(res.Query);
            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    );
    this.report02$ = this.appointmentService.getDashboard(this.businessId, this.locationId, initD, finD, 2).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            this.loadCharts02(res.Query);
            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    );
    this.report03$ = this.appointmentService.getDashboard(this.businessId, this.locationId, initD, finD, 3).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            this.loadCharts03(res.Query);
            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    );
    this.report04$ = this.appointmentService.getDashboard(this.businessId, this.locationId, initD, finD, 4).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            this.loadCharts04(res.Query);
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
    this.report01$ = this.appointmentService.getDashboard(this.businessId, this.locationId, initD, finD, 1).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (this.locationId != '_'){
              this.loadCharts01(res.Query.filter(x => x.location == this.locationId));
            } else {
              this.loadCharts01(res.Query);
            }
            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    );
    this.report02$ = this.appointmentService.getDashboard(this.businessId, this.locationId, initD, finD, 2).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (this.locationId != '_'){
              this.loadCharts02(res.Query.filter(x => x.location == this.locationId));
            } else {
              this.loadCharts02(res.Query);
            }
            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    );
    this.report03$ = this.appointmentService.getDashboard(this.businessId, this.locationId, initD, finD, 3).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (this.locationId != '_'){
              this.loadCharts03(res.Query.filter(x => x.location == this.locationId));
            } else {
              this.loadCharts03(res.Query);
            }
            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    );
    this.report04$ = this.appointmentService.getDashboard(this.businessId, this.locationId, initD, finD, 4).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (this.locationId != '_'){
              this.loadCharts04(res.Query.filter(x => x.location == this.locationId));
            } else {
              this.loadCharts04(res.Query);
            }
            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    );
  }

  loadCharts01(data){
    am4core.useTheme(am4themes_animated);
    chart = am4core.create("chartdiv01", am4charts.PieChart);
    chart.data = data;

    // Add and configure Series
    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "citas";
    pieSeries.dataFields.category = "service";
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

  loadCharts02(data){
    am4core.useTheme(am4themes_animated);
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
    series.columns.template.tooltipText = "{valueY.value}";
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
    for (let item of data){
      this.createSeries03(chart03, item.dateOpe, item.dateOpe, xAxis);
    }
  }

  createSeries03(chart03, value, name, xAxis) {
    let series = chart03.series.push(new am4charts.ColumnSeries())
    series.dataFields.valueY = value
    series.dataFields.categoryX = 'location'
    series.name = name
    series.columns.template.column.tooltipText = "{valueY.value}";
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
    for (let item of result){
      let prov = item.provider.replace(/[^a-zA-Z]/g, "");
      let provName = item.provider;
      let res = {
        dateOpe: item.dateOpe, 
        location: item.location, 
        [prov]: +item.citas,
        provider: provName 
      }
      data.push(res);
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

    let unique = [...new Set(data.map(item => item.provider))];
    for (let item of unique){
      let prov = item.replace(/[^a-zA-Z]/g, "");
      this.createSeries(chart04, prov, item);
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

  onLocationChange(event){
    this.locationId = event.value;
  }
}
