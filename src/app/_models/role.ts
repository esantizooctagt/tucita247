import { Access } from './access';

export class Role {
    constructor (
        public Role_Id: string,
        public Business_Id: string,
        public Name: string,
        public Status: Number,
        public Access?: Access[],
    ){}
}