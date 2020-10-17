import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-learn-dialog',
  templateUrl: './learn-dialog.component.html',
  styleUrls: ['./learn-dialog.component.scss']
})
export class LearnDialogComponent implements OnInit {
  message = ''
  accepted = false
  constructor() { }

  ngOnInit(): void {
  }

}
