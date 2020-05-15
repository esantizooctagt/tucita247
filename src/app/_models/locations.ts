// import { Cashier } from './cashier';

export class Location {
    constructor (
        public LocationId: string,
        public BusinessId: string,
        public Name: string,
        public Address: string,
        public Postal_Code: string,
        public Tax_Number: string,
        public Status: number,
        public Cashier_No: number
        // public Cashiers?: Cashier[]
    ){}
}