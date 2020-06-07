import { Question } from './questions';

export class Poll {
    constructor (
        public PollId: string,
        public Name: string,
        public DatePoll: string,
        public LocationId?: string,
        public Status?: number,
        public Questions?: Question[],
    ){}
}