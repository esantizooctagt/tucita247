import { Access } from './access';

export class Role {
    constructor (
        public Role_Id: string,
        public Company_Id: string,
        public Name: string,
        public Status: Number,
        public Access?: Access[],
    ){}
}