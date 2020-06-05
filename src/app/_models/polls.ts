import { Question } from './questions';

export class Poll {
    constructor (
        public PollId: string,
        public BusinessId: string,
        public Name: string,
        public Status?: number,
        public Questions?: Question[],
    ){}
}