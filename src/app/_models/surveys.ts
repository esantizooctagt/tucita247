import { Question } from './questions';

export class Survey {
    constructor (
        public SurveyId: string,
        public Name: string,
        public DateSurvey: string,
        public LocationId?: string,
        public Status?: number,
        public Questions?: Question[],
    ){}
}