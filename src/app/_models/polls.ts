export class Poll {
    constructor (
        public PollId: string,
        public Name: string,
        public DatePoll: string,
        public DateFinPoll: string,
        public LocationId?: string,
        public Location?: string,
        public Status?: number,
        public Happy?: number,
        public Neutral?: number,
        public Angry?: number,
    ){}
}