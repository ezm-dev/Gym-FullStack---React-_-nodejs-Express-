import { DatabaseModel } from "./DatabaseModel.mjs";

/**
 * class to create Session
 * @extends DatabaseModel
 */
export class SessionModel extends DatabaseModel{
    /**
     * Create SessionModel instance
     * @param {number} id -session id
     * @param {number} activityId -activity id
     * @param {number} trainerId -trainer id
     * @param {number} locationId -location id
     * @param {date} date -session date
     * @param {time} startTime -session start time
     * @param {number} duration -session duration
     */
    constructor (id, activityId, trainerId, locationId, date, startTime, duration){
        super()
        this.id = id,
        this.activityId = activityId,
        this.trainerId = trainerId,
        this.locationId = locationId
        this.date = date
        this.startTime = startTime 
        this.duration = duration
    }
    
    /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {SessionModel} SessionModel instance
     */
    static tableToModel(row){
        return new SessionModel(  
           row["id"],
           row["activity_id"], 
           row["trainer_id"] ,
           Number(row["location_id"]),
            row["date"],
            row["start_time"],
           Number(row["duration"])
        )

    }

    /**
     * Getting a list of all sessions
     * @returns {Promise<Array<SessionModel>>}
     */

    static getAll(){
        return this.query(" SELECT * FROM sessions")
        //map give list of things , give operation, it does that operation on each item in the list
        .then(results => results.map(row => this.tableToModel(row.sessions)))
    }


    /**
     * Getting session by id
     * @param {number} id  - session id
     * @returns {Promise<SessionModel|null>} -SessionModel or  null otherwise
     */
    static getById(id){
        return this.query("SELECT * From sessions WHERE id= ?",[id])
        .then(result => result.length > 0?this.tableToModel(result[0].sessions):Promise.reject("not found")) //trigger catch with error tohandle it
        

    }
    
    /**
     * Creating session in database
     * @param {SessionModel} session 
     * @returns {Promise<mysql.OkPacket>}
     */
    static async create(session){
        return this.query(`INSERT INTO sessions 
            (activity_id, trainer_id, location_id, date, start_time,duration) 
            VALUES(?,?,?,?,?,?)`,[session.activityId, session.trainerId, session.locationId, session.date, session.startTime,session.duration])
    }
  /**
   * Updating session in the database
   * @param {SessionModel} session 
   * @returns{Promise<mysql.OkPacket>} 
   */
    static async update(session){
        return this.query(`UPDATE sessions SET 
            activity_id = ?, trainer_id = ?, location_id = ?, date = ?, start_time =?,duration =?
            WHERE id =? `, [session.activityId, session.trainerId, session.locationId, session.date, session.startTime, session.duration, session.id] )
    }
   /**
    * Deleting session from the database
    * @param {number} id session id
    * @returns {Promise<mysql.OkPacket>} 
    */
    static async delete(id){
        return this.query("DELETE FROM sessions WHERE id =?", [id])
        .then(result => result.affectedRows >0 ? result :Promise.reject("not found") )
    }


    

}

//Testing 
// SessionModel.getAll()
// .then(sessions => console.log(sessions))

//  SessionModel.getById(2)
//  .then(sessions => console.log(sessions))




////INSERT///////////
// const newSession = new SessionModel(null, 5, 3, 2, "2025-02-05","07:00",90)
// SessionModel.create(newSession)
// .then(result => console.log(result))
// .catch(error => console.error(error))


///UPDATE////////

// SessionModel.getById(30) //retrieve 
// .then(session =>{
//  session.duration =100 //change
//  SessionModel.update(session) //update
//     .then(result => console.log("The session is updated in the database. "))
//     .catch(error => console.error("There was as issue updaing the session in the database"))

// })
// .catch(error => console.error("There was an issue updating the session: The session is "+error))

//DELETE////////////
// SessionModel.delete(26)
// .then(result => console.log(result))
// .catch(error => console.error(error))