import { ActivityModel } from "./ActivityModel.mjs";
import { DatabaseModel } from "./DatabaseModel.mjs";
import { LocationModel } from "./LocationModel.mjs";
import { SessionModel } from "./SessionModel.mjs";
import { UserModel } from "./UserModel.mjs";



/**
 * Class to create Join-model of (Session, Activity, Location, Trainer)Models
 */
// SessionALT(Acitivty, Location, Trainer)
export class SessionALTModel extends DatabaseModel {

    /**
     * Creating instance of Join-model 
     * wich encapulates(Session, Activity, Location, Trainer) Models
     * @param {SessionModel} session 
     * @param {ActivityModel} activity 
     * @param {LocationModel} location 
     * @param {UserModel} user 
     */
    constructor(session, activity, location, user) {
        super()
        this.session = session
        this.activity = activity
        this.location = location
        this.user = user //trainer
    }

    /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {SessionALTModel} SessionAlt Model instance
     */
    static tableToModel(row) {
        return new SessionALTModel(
            SessionModel.tableToModel(row.sessions),
            ActivityModel.tableToModel(row.activities),
            LocationModel.tableToModel(row.locations),
            UserModel.tableToModel(row.users)
        )
    }


    /**
     * Getting All sessions and its details(activities, users, locations)
     * @returns{Array<SessionALTModel>} 
     * 
     */
    static getAll() {
        return this.query(`          
            select *
            from sessions
            inner join  activities
            on sessions.activity_id = activities.id
            and activities.deleted = 0
            inner join  users
            on sessions.trainer_id = users.id
                and users.deleted = 0
            inner join locations
           on sessions.location_id = locations.id
           and locations.deleted = 0
            order by sessions.date,sessions.start_time
          
            `).then(results => results.map(row => this.tableToModel(row)))

    }



    /**
     * Getting session details by id
     * @param {number} id session id
     * @returns {Array<SessionALTModel>}
     */
    static getById(id) {
        return this.query(`          
            select *
            from sessions
            inner join  activities
            on sessions.activity_id = activities.id
            and activities.deleted = 0
            inner join  users
            on sessions.trainer_id = users.id
                and users.deleted = 0
            inner join locations
           on sessions.location_id = locations.id
           and locations.deleted = 0
           WHERE sessions.id= ?
            `, [id]).then(result =>
            result.length > 0
                ? this.tableToModel(result[0])
                : Promise.reject("not found")
        )// used in bookings this way 


    }

    /**
     * Getting the sessions details between 2 dates
     * @param {date} start -session start date
     * @param {date} end -session end date
     * @returns {Array<SessionALTModel>}
     */
    //Get sessions between 2 dates (Session CRUDS)
    static getSessionBetweenDates(start, end) {
        return this.query(`
      SELECT *
      from sessions
            inner join  activities
            on sessions.activity_id = activities.id
            and activities.deleted = 0
            inner join  users
            on sessions.trainer_id = users.id
                and users.deleted = 0
            inner join locations
           on sessions.location_id = locations.id
           and locations.deleted = 0
      WHERE sessions.date BETWEEN ? AND ?
      order BY sessions.date, activities.name
      `, [start, end])
            .then(result => result.map(row => this.tableToModel(row)))
    }

    /**
     * Getting the trainers(users) of the sessions
     * @param {id} trainerId -usre(trainer id)
     * @returns {Promise<SessionModel|null>} -SessionAlt Object or null otherwise
     */
    static getSessionsByTrainerId(trainerId) {
        return this.query(`
      SELECT *
      from sessions
            inner join  activities
            on sessions.activity_id = activities.id
            and activities.deleted = 0
            inner join  users
            on sessions.trainer_id = users.id
                and users.deleted = 0
            inner join locations
           on sessions.location_id = locations.id
           and locations.deleted = 0
      WHERE sessions.trainer_id =?
      order BY sessions.date, activities.name
      `, [trainerId])
            .then(result => result.map(row => this.tableToModel(row)))
    }



   /**
    * Getting  session by date and activity 
    * @param {date} date -session date
    * @param {string} activity -session activity
    * @returns {Promise<SessionModel|null>} -SessionAlt Object or null otherwise
    */
    static getByDateAndActivity(date, activity) {
        return this.query(`
            SELECT * 
            from sessions
            inner join  activities
            on sessions.activity_id = activities.id
            and activities.deleted = 0
            inner join  users
            on sessions.trainer_id = users.id
                and users.deleted = 0
            inner join locations
           on sessions.location_id = locations.id
           and locations.deleted = 0
          WHERE sessions.date= ?
        AND  activities.name =  ? 
          
    `, [date, activity])
            .then(result => result.map(row => this.tableToModel(row)))
    }///In old it was  [this.toMySqlDate(date),activity])


    /**
     * Get sessions by activity name only.
     * @param {string} activity - The session activity name
     * @returns {Promise<SessionModel[]>} - Array of SessionAlt objects
     */
    static getByActivity(term) {
        return this.query(`
           SELECT * 
            from sessions
            inner join  activities
            on sessions.activity_id = activities.id
            and activities.deleted = 0
            inner join  users
            on sessions.trainer_id = users.id
                and users.deleted = 0
            inner join locations
           on sessions.location_id = locations.id
           and locations.deleted = 0
          WHERE (activities.name Like ?  or activities.description like ?)
    `,  [`%${term}%`, `%${term}%`])
            .then(result => result.map(row => this.tableToModel(row)))
    }


  


  /**
   * Getting the trainer for certain session details
   * @param {date} date -session date
   * @param {string} activity -session activity
   * @param {string} location -session location
   * @returns {Array<SessionALTModel>}
   */
    static getTrainerTime(date, activity, location) {
        return this.query(`
            SELECT * 
            from sessions
            inner join  activities
            on sessions.activity_id = activities.id
            and activities.deleted = 0
            inner join  users
            on sessions.trainer_id = users.id
                and users.deleted = 0
            inner join locations
           on sessions.location_id = locations.id
           and locations.deleted = 0
          WHERE sessions.date= ?
        AND  activities.name =  ? 
        AND  locations.name =  ? 

          
    `, [date, activity, location])
            .then(result => result.map(row => this.tableToModel(row)))
    }

    //getting the sessions for trianer (trainer sessions)
    /**
     * 
     * @param {number} userId 
     * @returns {Promise<SessionModel|null>} -SessionAlt Object or null otherwise
     */
    static getSessionsByTriner(userId) {
        return this.query(`
        SELECT * 
        from sessions
        inner join  activities
        on sessions.activity_id = activities.id
        and activities.deleted = 0
        inner join locations
       on sessions.location_id = locations.id
       and locations.deleted = 0
        inner join  users
        on sessions.trainer_id = users.id
           where users.deleted = 0
            and sessions.trainer_id =?
            order by sessions.date,sessions.start_time

      
`, [userId])
            .then(result => result.map(row => this.tableToModel(row)))
    }




}







//Testing

// SessionALTModel.getAll()
//     .then(results => console.log(results))
//     .catch(error => console.log(error))

// SessionALTModel.getById(34)
//     .then(results => console.log(results))
//     .catch(error => console.log(error))

// SessionALTModel.getByDateAndActivity("2025-05-12","HIIT")***********
// .then(results => console.log(results))
//     .catch(error => console.log(error))

//SessionALTModel.getByStartAndEndDate("2025-02-20T14:00:00.000Z","2025-02-27T14:00:00.000Z")


// SessionALTModel.getActivityByDate("2025-02-24T14:00:00.000Z","2025-03-02T14:00:00.000Z")
// .then(results => console.log(results))
//     .catch(error => console.log(error))




//    SessionALTModel.getBookingDetailsByUser(2)
//    .then(results =>{
//     console.log(results)
//    })
//     .catch(error => console.log(error))



// SessionALTModel.getSessionsByTriner(3)
// .then(results =>{
//         console.log(results)
//        })
//         .catch(error => console.log(error))
