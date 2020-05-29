export class Appointment {
    constructor (
        public BusinessId: string,
        public LocationId: string,
        public AppointmentId: string,
        public ClientId: string,
        public FirstName: string,
        public LastName: string,
        public Phone: string,
        public OnBehalf: number,
        public Type: number,
        public DateAppo: string,
        public Status: number
    ){}
}