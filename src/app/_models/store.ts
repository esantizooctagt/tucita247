// import { Cashier } from './cashier';

export class Store {
    constructor (
        public StoreId: string,
        public businessId: string,
        public Name: string,
        public Address: string,
        public Postal_Code: string,
        public Tax_Number: string,
        public Status: number,
        public Cashier_No: number
        // public Cashiers?: Cashier[]
    ){}
}