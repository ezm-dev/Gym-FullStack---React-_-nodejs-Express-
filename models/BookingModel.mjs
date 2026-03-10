import { DatabaseModel } from "./DatabaseModel.mjs";

/**
 * class to create BookingModel
 * @extends DatabaseModel
 */
export class BookingModel extends DatabaseModel {
    /**
     * Create BookingModel instance
     * @param {number} id booking id
     * @param {number} userId user id
     * @param {number} sessionId session id
     * @param {date} bookingDate booking date
     */
    constructor(id, userId, sessionId, bookingDate) {
        super()
        this.id = id
        this.userId = userId
        this.sessionId = sessionId
        this.bookingDate = bookingDate
    }


     /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {BookingModel} BookingModel instance
     */
    static tableToModel(row) {
        return new BookingModel(
            row["id"],
            row["user_id"],
            row["session_id"],
            row["booking_date"],
        )

    }
   
    /**
     * * Getting the list of all bookings from database
     * @returns {Promise<Array<BookingModel>>} list of all bookings
     */
    static getAll() {
        return this.query("select * from bookings")
            .then(result => result.map(row => this.tableToModel(row.bookings)))
    }

    
     /**
     * Getting the bookings by user email
     * @param {string} email 
     * @returns {Promise<BookingModel|null>} -BookingModel or null otherwise
     */
    static getByEmail(email) {
        return this.query(`select * from bookings where email=?`,[email])
            .then(result => result.map(row => this.tableToModel(row.bookings)))
    }




    /**
     * Getting the bookings by Id
     * @param {number} BookingId 
     * @returns {Promise<BookingModel>}
     */
    static getById(id) {
        return this.query(`SELECT * From bookings WHERE id= ?`, [id])
            .then(result => result.length > 0 ? this.tableToModel(result[0].bookings) : Promise.reject("not found")) //trigger catch with error tohandle it


    }
    
 



    /**
     * Creating Booking in the database
     * @param {BookingModel} booking 
     * @returns {Promise<mysql.QueryResult>}
     */

    static create(booking) {
        return this.query(` INSERT INTO bookings
            (user_id,session_id, booking_date)
           VALUES(?,?,?) `, [booking.userId, booking.sessionId, booking.bookingDate])
    }

  /**
   * Delete Booking in the database
   * @param {int} id  - booking id
   * @returns {Promise<OkPacket>}
   */

    static delete(id) {
        return this.query(
            `DELETE FROM bookings WHERE id= ? `, [id])

    }

    /**
     * Delete booking for certain sesion
     * @param {number} sessionId 
     * @returns {Promise<OkPacket>}
     */
    static deleteBookingsBySessionId(sessionId) {
        return this.query(
            `DELETE FROM bookings WHERE session_id= ? `, [sessionId])

    }

    /**
     * Delete booking by user id
     * @param {*} userId 
     * @returns {Promise<OkPacket>}
     */
    
    static deleteBookingsByUserId(userId) {
        return this.query(
            `DELETE FROM bookings WHERE user_id= ? `, [userId])

    }
}

//Testing
// BookingModel.getAll()
// .then(bookings => console.log(bookings))

//get booking for userid
//  BookingModel.getById(2)
//  .then(booking=> console.log(booking))



// //create booking
// const newBooking = new BookingModel(null, 3,4, DatabaseModel.toMySqlDate(new Date())) // newDate to mysqldate
// BookingModel.create(newBooking)
// .then(result => console.log(result))
// .catch(error => console.error(error))


//DELETE////////////
// BookingModel.delete(3)
// .then(result => console.log(result))
// .catch(error => console.error(error))