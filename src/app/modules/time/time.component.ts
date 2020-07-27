import { Component, OnInit } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker/calendar';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss']
})
export class TimeComponent implements OnInit {
  minJan = new Date(2020, 0, 1);
  maxJan = new Date(2020, 0, 31);
  minFeb = new Date(2020, 1, 1);
  maxFeb = new Date(2020, 1, 29);
  minMar = new Date(2020, 2, 1);
  maxMar = new Date(2020, 2, 31);
  minApr = new Date(2020, 3, 1);
  maxApr = new Date(2020, 3, 30);
  minMay = new Date(2020, 4, 1);
  maxMay = new Date(2020, 4, 31);
  minJun = new Date(2020, 5, 1);
  maxJun = new Date(2020, 5, 30);
  minJul = new Date(2020, 6, 1);
  maxJul = new Date(2020, 6, 31);
  minAug = new Date(2020, 7, 1);
  maxAug = new Date(2020, 7, 31);
  minSep = new Date(2020, 8, 1);
  maxSep = new Date(2020, 8, 30);
  minOct = new Date(2020, 9, 1);
  maxOct = new Date(2020, 9, 31);
  minNov = new Date(2020, 10, 1);
  maxNov = new Date(2020, 10, 30);
  minDec = new Date(2020, 11, 1);
  maxDec = new Date(2020, 11, 31);
  selectedDate: any;

  janSelected: any[] = [];
  febSelected: any[] = [];
  marSelected: any[] = [];
  aprSelected: any[] = [];
  maySelected: any[] = [];
  junSelected: any[] = [];
  julSelected: any[] = [];
  augSelected: any[] = [];
  sepSelected: any[] = [];
  octSelected: any[] = [];
  novSelected: any[] = [];
  decSelected: any[] = [];

  links = [{label:'First',link:'/dashboard'}, {label:'Second',link:'/schedule'}];
  activeLink = this.links[0];
  background: ThemePalette = undefined;
  constructor() { }

  ngOnInit(): void {
  }

  isSelectedJan = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.janSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedFeb = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.febSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedMar = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.marSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedApr = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.aprSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedMay = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.maySelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedJun = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.junSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedJul = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.julSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedAug = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.augSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedSep = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.sepSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedOct = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.octSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedNov = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.novSelected.find(x => x == date) ? "selected" : null;
  };

  isSelectedDec = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    
    return this.decSelected.find(x => x == date) ? "selected" : null;
  };

  onSelect(event: any, calendar: any, month: any[]) {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    const index = month.findIndex(x => x == date);
    
    if (index < 0) month.push(date);
    else month.splice(index, 1);
    
    calendar.updateTodaysDate();
  }

}
