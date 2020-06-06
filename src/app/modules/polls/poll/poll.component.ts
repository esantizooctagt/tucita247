import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {
  minDate: Date;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder
  ) { }

  get fQuestions(){
    return this.pollForm.get('Questions') as FormArray;
  }

  get f(){
    return this.pollForm.controls;
  }

  pollForm = this.fb.group({
    PollId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    DatePoll: ['', Validators.required],
    Status: [false],
    Questions : this.fb.array([this.addQuestion()])
  });

  addQuestion(): FormGroup {
    const items = this.fb.group({
      QuestionId: [''],
      Description: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]]
    })
    return items;
  }
  ngOnInit(): void {
    this.minDate = new Date();
  }

  getErrorMessage(component: string){

  }

  onCancel(){

  }

  onSubmit(){

  }
}
