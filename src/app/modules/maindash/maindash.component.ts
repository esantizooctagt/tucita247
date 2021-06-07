import { Component, OnInit } from '@angular/core';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { AppointmentService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-maindash',
  templateUrl: './maindash.component.html',
  styleUrls: ['./maindash.component.scss']
})
export class MaindashComponent implements OnInit {
  chart: am4charts.PieChart;
  chart02: am4charts.XYChart;
  chart03: am4charts.XYChart;
  chart04: am4charts.XYChart;
  businessId: string = '';
  report$: Observable<any>;
  xAxis: any;
  endDate: any;
  initDate: any;

  constructor(
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
    this.report$ = this.appointmentService.getDashboard(this.businessId, initD, finD).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            console.log(res);
            this.loadCharts01(res.Query01);
            this.loadCharts02(res.Query02);
            this.loadCharts03(res.Query03);
            this.loadCharts04(res.Query04);
            this.spinnerService.stop(spinnerRef);
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    )
  }

  process(){
    const inDate = new Date(this.initDate);
    const finDate = new Date(this.endDate);
    
    let initD = inDate.getFullYear().toString() + '-' + (1+inDate.getMonth()).toString().padStart(2, '0') + '-' + inDate.getDate().toString().padStart(2, '0') + ' 00:00:00.000';
    let finD = finDate.getFullYear().toString() + '-' + (1+finDate.getMonth()).toString().padStart(2, '0') + '-' + finDate.getDate().toString().padStart(2, '0') + ' 23:59:59.000';
    this.businessId = this.authService.businessId();
    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadingdata:`);
    this.report$ = this.appointmentService.getDashboard(this.businessId, initD, finD).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            console.log(res);
            this.loadCharts01(res.Query01);
            this.loadCharts02(res.Query02);
            this.loadCharts03(res.Query03);
            this.loadCharts04(res.Query04);
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
    this.chart = am4core.create("chartdiv01", am4charts.PieChart);
    this.chart.data = data;
    
    // Add and configure Series
    let pieSeries = this.chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "citas";
    pieSeries.dataFields.category = "service";
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    
    // This creates initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;
  }

  loadCharts02(data){
    am4core.useTheme(am4themes_animated);
    this.chart02 = am4core.create("chartdiv02", am4charts.XYChart);

    this.chart02.hiddenState.properties.opacity = 0;
    this.chart02.data = data;

    let categoryAxis = this.chart02.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "name";
    categoryAxis.renderer.minGridDistance = 40;
    categoryAxis.fontSize = 11;

    let valueAxis = this.chart02.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 40;
    valueAxis.strictMinMax = true;
    valueAxis.renderer.minGridDistance = 30;
    // axis break
    let axisBreak = valueAxis.axisBreaks.create();
    axisBreak.startValue = 2100;
    axisBreak.endValue = 22900;
    //axisBreak.breakSize = 0.005;

    // fixed axis break
    let d = (axisBreak.endValue - axisBreak.startValue) / (valueAxis.max - valueAxis.min);
    axisBreak.breakSize = 0.05 * (1 - d) / d; // 0.05 means that the break will take 5% of the total value axis height

    // make break expand on hover
    let hoverState = axisBreak.states.create("hover");
    hoverState.properties.breakSize = 1;
    hoverState.properties.opacity = 0.1;
    hoverState.transitionDuration = 1500;

    axisBreak.defaultState.transitionDuration = 1000;

    let series = this.chart02.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "name";
    series.dataFields.valueY = "citas";
    series.columns.template.tooltipText = "{valueY.value}";
    series.columns.template.tooltipY = 0;
    series.columns.template.strokeOpacity = 0;

    // // chart.paddingRight = 20;

    // // let data = [];
    // // let visits = 10;
    // // for (let i = 1; i < 366; i++) {
    // //   visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
    // //   data.push({ date: new Date(2018, 0, i), name: "name" + i, value: visits });
    // // }

    // // chart.data = data;

    // // let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    // // dateAxis.renderer.grid.template.location = 0;

    // // let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // // valueAxis.tooltip.disabled = true;
    // // valueAxis.renderer.minWidth = 35;

    // // let series = chart.series.push(new am4charts.LineSeries());
    // // series.dataFields.dateX = "date";
    // // series.dataFields.valueY = "value";
    // // series.tooltipText = "{valueY.value}";

    // // chart.cursor = new am4charts.XYCursor();

    // // let scrollbarX = new am4charts.XYChartScrollbar();
    // // scrollbarX.series.push(series);
    // // chart.scrollbarX = scrollbarX;

    // // this.chart = chart;
    // // Add data
    // this.chart.data = [{
    //   "year": "2016",
    //   "europe": 2.5,
    //   "namerica": 2.5,
    //   "asia": 2.1,
    //   "lamerica": 0.3,
    //   "meast": 0.2,
    //   "africa": 0.1
    // }, {
    //   "year": "2017",
    //   "europe": 2.6,
    //   "namerica": 2.7,
    //   "asia": 2.2,
    //   "lamerica": 0.3,
    //   "meast": 0.3,
    //   "africa": 0.1
    // }, {
    //   "year": "2018",
    //   "europe": 2.8,
    //   "namerica": 2.9,
    //   "asia": 2.4,
    //   "lamerica": 0.3,
    //   "meast": 0.3,
    //   "africa": 0.1
    // }];

    // // Create axes
    // let categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
    // categoryAxis.dataFields.category = "year";
    // categoryAxis.renderer.grid.template.location = 0;


    // let valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.renderer.inside = true;
    // valueAxis.renderer.labels.template.disabled = true;
    // valueAxis.min = 0;

    // this.createSeries("europe", "Europe");
    // this.createSeries("namerica", "North America");
    // this.createSeries("asia", "Asia-Pacific");
    // this.createSeries("lamerica", "Latin America");
    // this.createSeries("meast", "Middle-East");
    // this.createSeries("africa", "Africa");

    // // Legend
    // this.chart.legend = new am4charts.Legend();
  }
  
  loadCharts03(result){
    let data: any[]=[];
    for (let item of result){
      let loc = item.location.replace(/[^a-zA-Z]/g, "");
      let locName = item.location;
      let res = {
        dateOpe: item.dateOpe, 
        [loc]: +item.citas,
        location: locName 
      }
      data.push(res);
    }

    let chart = am4core.create('chartdiv03', am4charts.XYChart)
    chart.colors.step = 2;

    chart.legend = new am4charts.Legend()
    chart.legend.position = 'top'
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 95

    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'dateOpe'
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;

    let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;

    chart.data = data;
    for (let item of data){
      let loc = item.location.replace(/[^a-zA-Z]/g, "");
      this.createSeries03(chart, loc, item.location, xAxis);
    }
  }

  createSeries03(chart, value, name, xAxis) {
    let series = chart.series.push(new am4charts.ColumnSeries())
    series.dataFields.valueY = value
    series.dataFields.categoryX = 'dateOpe'
    series.name = name

    series.events.on("hidden", this.arrangeColumns(chart, xAxis));
    series.events.on("shown", this.arrangeColumns(chart, xAxis));

    let bullet = series.bullets.push(new am4charts.LabelBullet())
    bullet.interactionsEnabled = false
    bullet.dy = 30;
    bullet.label.text = '{valueY}'
    bullet.label.fill = am4core.color('#ffffff')

    return series;
  }

  arrangeColumns(chart, xAxis) {
    let series = chart.series.getIndex(0);

    let w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
    if (series.dataItems.length > 1) {
      let x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
      let x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
      let delta = ((x1 - x0) / chart.series.length) * w;
      if (am4core.isNumber(delta)) {
        let middle = chart.series.length / 2;

        let newIndex = 0;
        chart.series.each(function(series) {
          if (!series.isHidden && !series.isHiding) {
              series.dummyData = newIndex;
              newIndex++;
          }
          else {
              series.dummyData = chart.series.indexOf(series);
          }
        })
        let visibleCount = newIndex;
        let newMiddle = visibleCount / 2;

        chart.series.each(function(series) {
            let trueIndex = chart.series.indexOf(series);
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

    this.chart04 = am4core.create("chartdiv04", am4charts.XYChart);
    this.chart04.data = data;

    // Create axes
    let categoryAxis = this.chart04.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "dateOpe";
    categoryAxis.renderer.grid.template.location = 0;

    let valueAxis = this.chart04.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inside = true;
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.min = 0;

    for (let item of data){
      let prov = item.provider.replace(/[^a-zA-Z]/g, "");
      this.createSeries(prov, item.provider);
    }

    // Legend
    this.chart04.legend = new am4charts.Legend();
  }

  // Create series
  createSeries(field, name) {
    // Set up series
    let series = this.chart04.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.valueY = field;
    series.dataFields.categoryX = "dateOpe";
    series.sequencedInterpolation = true;
    
    // Make it stacked
    series.stacked = true;
    
    // Configure columns
    series.columns.template.width = am4core.percent(60);
    series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";
    
    // Add label
    let labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY}";
    labelBullet.locationY = 0.5;
    labelBullet.label.hideOversized = true;
    
    return series;
  }
}
