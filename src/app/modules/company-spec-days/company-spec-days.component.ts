import { Component, OnInit } from '@angular/core';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'app-company-spec-days',
  templateUrl: './company-spec-days.component.html',
  styleUrls: ['./company-spec-days.component.scss']
})
export class CompanySpecDaysComponent implements OnInit {
  links = ['Opening hours', 'Special days'];
  activeLink = this.links[1];
  background: ThemePalette = 'primary';

  constructor() { }

  ngOnInit(): void {
  }

}
