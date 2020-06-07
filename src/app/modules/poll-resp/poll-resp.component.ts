import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PollsService } from '@app/services';
import { Observable } from 'rxjs';
import { Poll, Question } from '@app/_models';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormArray } from '@angular/forms';

@Component({
  selector: 'app-poll-resp',
  templateUrl: './poll-resp.component.html',
  styleUrls: ['./poll-resp.component.scss']
})
export class PollRespComponent implements OnInit {
  pollId: string = '';
  custId: string = '';
  noItems: number = 0;
  savePoll: boolean = false;

  savePoll$: Observable<any>;
  pollData$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private pollService: PollsService,
    private _snackBar: MatSnackBar,
    private spinnerService: SpinnerService
  ) { }

  get fQuestions(){
    return this.pollForm.get('Questions') as FormArray;
  }

  get f(){
    return this.pollForm.controls;
  }

  pollForm = this.fb.group({
    PollId: [''],
    Name: [''],
    LocationId: [''],
    DatePoll: [''],
    Status: [true],
    Questions : this.fb.array([])
  });

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    this.pollId = this.route.snapshot.paramMap.get('pollId');
    this.custId = this.route.snapshot.paramMap.get('custId');

    var spinnerRef = this.spinnerService.start("Loading Poll...");
    this.pollData$ = this.pollService.getPoll(this.pollId).pipe(
      map((poll: any) => {
        this.pollForm.setValue({
          PollId: poll.PollId,
          Name: poll.Name,
          LocationId: poll.LocationId,
          DatePoll: '',
          Status: (poll.Status == 1 ? true : false),
          Questions: []
        });
        this.pollForm.setControl('Questions', this.setExistingPolls(poll.Questions));
        this.spinnerService.stop(spinnerRef);
        return '';
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openSnackBar("Something goes wrong, try again","Error !");
        return err.message;
      })
    );
  }

  setExistingPolls(quest: Question[]): FormArray{
    const formArray = new FormArray([]);
    quest.forEach(res => {
      formArray.push(this.fb.group({
          QuestionId: res.QuestionId,
          Description: res.Description,
          Status: res.Status,
          Happy: res.Happy,
          Neutral: res.Neutral,
          Angry: res.Angry,
          Result: 0
        })
      );
      this.noItems = this.noItems +1;
    });
    return formArray;
  }
  
  onSubmit(){
    let items = this.pollForm.value.Questions;
    let detail = [];
    items.forEach(ele => {
      detail.push({QuestionId: ele.QuestionId, Happy: (ele.Result == 1 ? 1 : 0), Neutral: (ele.Result == 2 ? 1 : 0), Angry: (ele.Result == 3 ? 1 : 0)});
    })
    let formData = {
      PollId: this.pollForm.value.PollId,
      CustomerId: this.custId,
      LocationId: this.pollForm.value.LocationId,
      Questions: detail
    }
    this.savePoll = false;
    var spinnerRef = this.spinnerService.start("Saving Poll...");
    this.savePoll$ =  this.pollService.postPollUser(formData).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.savePoll = true
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openSnackBar("Something goes wrong, try again","Error !");
          }
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar("Something goes wrong, try again","Error !");
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openSnackBar("Something goes wrong, try again","Error !");
        return err.message;
      })
    );
  }
}
