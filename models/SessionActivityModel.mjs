
import { ActivityModel } from "./ActivityModel.mjs";
import { DatabaseModel } from "./DatabaseModel.mjs";
import { LocationModel } from "./LocationModel.mjs";
import { SessionModel } from "./SessionModel.mjs";
import { UserModel } from "./UserModel.mjs";



/**
 * Class to create Join-model of (Session, Activity)Models
 * for calnedar
 */
// 

export class SessionActivityModel extends DatabaseModel {

    /**
     * 
     * @param {SessionModel} session 
     * @param {ActivityModel} activity 
     */
    constructor(session, activity) {
        super()
        this.session = session
        this.activity = activity

    }


    /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {SessionActivityModel} SessionActivityModel instance
     */
    static tableToModel(row) {
        return new SessionActivityModel(
            SessionModel.tableToModel(row.sessions),
            ActivityModel.tableToModel(row.activities)
        )
    }


   /**
    * Getting the activities of sessions between 2 dates
    * @param {date} start -session start date
    * @param {date} end -session end date
    * @returns {Array<SessionActivityModel>}
    */
    // for calendar view(Get sessions'  activities per date)(No duplication)
    static getActivityByDate(start, end) {
            return this.query(`
            SELECT sessions.date, activities.name
            FROM sessions 
            INNER JOIN users
            on sessions.trainer_id = users.id
            and users.deleted =0
            INNER JOIN activities 
            ON sessions.activity_id = activities.id
                AND activities.deleted = 0
            WHERE sessions.date BETWEEN ? AND ?
            GROUP BY sessions.date, activities.name
            order BY sessions.date, activities.name
            `, [start, end])
                        .then(result => result.map(row => this.tableToModel(row)))
    }


}



//Testing


// SessionActivityModel.getActivityByDate("2025-05-01T14:00:00.000Z","2025-05-17T14:00:00.000Z")
// .then(results => console.log(results))
//     .catch(error => console.log(error))




/*Old:Error: not handle when the trainer is deleted , the session will not be shown

SELECT sessions.date, activities.name 
FROM sessions INNER JOIN activities 
ON sessions.activity_id = activities.id
 AND activities.deleted = 0
WHERE sessions.date BETWEEN ? AND ?
GROUP BY sessions.date, activities.name
order BY sessions.date, activities.name



*/