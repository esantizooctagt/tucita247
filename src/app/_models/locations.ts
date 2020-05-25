// import { Cashier } from './cashier';

export class Location {
    constructor (
        public LocationId: string,
        public BusinessId: string,
        public Name: string,
        public Address: string,
        public Geolocation: string,
        public ParentLocation: string,
        public TotalPiesTransArea: number,
        public LocationDensity: number,
        public MaxNumberEmployeesLocation: number,
        public MaxConcurrentCustomerLocation: number,
        public Open: string,
        public BucketInterval: number,
        public TotalCustPerBucketInter: number,
        public OperationHours: string,
        public Doors: string,
        public Status: number
    ){}
}