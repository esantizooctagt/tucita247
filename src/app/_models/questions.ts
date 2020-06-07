export class Question {
    constructor (
        public QuestionId: string,
        public Description: string,
        public Happy?: number,
        public Neutral?: number,
        public Angry?: number,
        public Status?: number
    ){}
}