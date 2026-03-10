import { ActivityModel } from "./ActivityModel.mjs";
import { BookingModel } from "./BookingModel.mjs";
import { DatabaseModel } from "./DatabaseModel.mjs";
import { LocationModel } from "./LocationModel.mjs";
import { SessionModel } from "./SessionModel.mjs";
import { UserModel } from "./UserModel.mjs";

/**
 * Class to create Join-model of (Booking, Session, Activity,Location, User)Models
 */

export class BookingsDetailsModel extends DatabaseModel {

    /**
     * Creating instance of Join-model 
     * @param {BookingModel} booking 
     * @param {SessionModel} session 
     * @param {ActivityModel} activity 
     * @param {LocationModel} location 
     * @param {UserModel} user 
     */
    constructor(booking,session, activity, location, user) {
        super()
        this.booking = booking
        this.session = session
        this.activity = activity
        this.location = location
        this.user = user //trainer
    }
   
    /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {BookingsDetailsModel} BookingsDetailsModel instance
     */
    static tableToModel(row) {
        return new BookingsDetailsModel(
            BookingModel.tableToModel(row.bookings),
            SessionModel.tableToModel(row.sessions),
            ActivityModel.tableToModel(row.activities),
            LocationModel.tableToModel(row.locations),
            UserModel.tableToModel(row.users)
        )
    }



  /**
     * Getting All Bookings and its details(sessions, users)
     * @returns{Array<BookingsDetailsModel>} 
     * 
     */
//getting Allthe booking details for Crud
static getAllBookingDetails() {
    return this.query(`
            select * 
            from bookings
            inner join users on
            bookings.user_id = users.id
            and users.deleted =0
			inner join sessions on
			bookings.session_id =   sessions.id 
            inner join locations on 
            sessions.location_id = locations.id
            inner join activities on 
            sessions.activity_id = activities.id
           order by sessions.date, sessions.start_time
    `).then(result => result.map(row => this.tableToModel(row)))
}



 /**
  * Getting bookings for certain user
  * @param {number} userId 
  * @returns {Array<BookingSessionUserModel>} Bookings 
  */
//getting the booking details for certain user (View My bookings)
static getBookingDetailsByUser(userId) {
    return this.query(`
            select * 
            from sessions
            inner join
            bookings
            on
            sessions.id = bookings.session_id
            and bookings.user_id = ?
            inner join users on
            sessions.trainer_id =users.id
            inner join locations on 
            sessions.location_id = locations.id
            inner join activities on 
            sessions.activity_id = activities.id
            order by sessions.date, sessions.start_time

          
    `, [userId]).then(result => result.map(row => this.tableToModel(row)))
}

/**
 * Getting bookings for certain user
 * @param {string} email -user email
 * @returns {Array<BookingSessionUserModel>} Bookings 
 */
static getBookingsDetailsByEmail(email) {
    return this.query(`
           

            select * 
            from bookings
            inner join users on
            bookings.user_id = users.id
			inner join sessions on
			bookings.session_id =   sessions.id 
            inner join locations on 
            sessions.location_id = locations.id
            inner join activities on 
            sessions.activity_id = activities.id
            where  users.email="m@m.com"
            order by sessions.date, sessions.start_time
          
    `, [email]).then(result => result.map(row => this.tableToModel(row))) //users.role="member"
}


 /**  Getting bookings for certain Member(API)
 * @param {id}  -user Id
 * @returns {Array<BookingSessionUserModel>} Bookings 
 */
static getBookingsDetailsByMemberId(id) {
    return this.query(`
           

            select * 
            from bookings
            inner join users on
            bookings.user_id = users.id
			inner join sessions on
			bookings.session_id =   sessions.id 
            inner join locations on 
            sessions.location_id = locations.id
            inner join activities on 
            sessions.activity_id = activities.id
            where  users.id=?
            order by sessions.date, sessions.start_time
          
    `, [id]).then(result => result.map(row => this.tableToModel(row))) //users.role="member"
}




}







//Testing



//    BookingsDetailsModel.getBookingDetailsByUser(10)
//    .then(results =>{
//     console.log(results)
//    })
//     .catch(error => console.log(error))

//     BookingsDetailsModel.getAllBookingDetails()
//    .then(results =>{     console.log(results)
//    })
//     .catch(error => console.log(error))
