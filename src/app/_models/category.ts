export class Category {
    constructor (
        public Category_Id: string,
        public Description: string,
        public Company_Id?: string,
        public Status?: number,
        public UserId?: string
    ){}
}