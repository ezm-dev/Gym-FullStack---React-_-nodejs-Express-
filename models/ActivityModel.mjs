import { DatabaseModel } from "./DatabaseModel.mjs";

/**
 * class to create ActivityModel
 * @extends DatabaseModel
 */
export class ActivityModel extends DatabaseModel{
    /**
     * Create ActivityModel instance
     * @param {number} id 
     * @param {string} name 
     * @param {string} description 
     * @param {number} deleted - indicates if the Activity is deleted =1,or 0 otherwise
     */
    constructor (id, name, description, deleted){
        super()
        this.id = id
        this.name = name 
        this.description = description
        this.deleted = deleted
   
    }
    /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {ActivityModel} ActivityMode instance
     */
       //take tabel  row and convert to model object(db --> js)
       static tableToModel(row){
        return new ActivityModel(
            row["id"],
            row["name"], 
            row["description"] ,
            row["deleted"]
        )

    }
     /**
     * * Getting the list of all activities from database
     * @returns {Promise<Array<ActivityModel>>} list of all activities
     */
    static getAll(){
        return this.query(" SELECT * FROM activities WHERE deleted = 0")
        //map give list of things , give operation, it does that operation on each item in the list
        .then(results => results.map(row => this.tableToModel(row.activities)))
    }


   /**
    * Getting the booking by booking id
    * @param {number} id -activity id
    * @returns {Promise<ActivityModel|null>} -ActivityModel or null otherwise
    */

    static getById(id){
        return this.query("SELECT * From activities WHERE id= ?",[id])
        .then(result => result.length > 0?this.tableToModel(result[0].activities):Promise.reject("not found")) //trigger catch with error tohandle it
        

    }

   /**
    * creatin activity in the database
    * @param {ActivityModel} activity 
    * @returns {Promise<mysql.QueryResult>}
    */

    static async create(activity){
        return this.query(`INSERT INTO activities
            (name, description) 
            VALUES(?,?)`,[activity.name,  activity.description])
    }

    /**
     * Updating activity in the database
     * @param {ActivityModel} activity 
     * @returns {Promise<mysql.OkPacket>}
     */

    static async update(activity){
        return this.query(`UPDATE activities SET 
            name= ?, description = ?
            WHERE id =? `, [activity.name, activity.description, activity.id] )
    }

    /**
     * Deleting activity by id(setting the deleted column equals to 1)
     * @param {number} id  activity id
     * @returns {Promise<mysql.OkPacket>}
     */

    static async delete(id) {
        return this.query(
            `UPDATE activities SET deleted = 1 WHERE id = ?`,
            [id]
        )
    }


}


//Testing
// ActivityModel.getAll()
// .then(activities => {
//     console.log(activities)
    

// })

// ActivityModel.getById(2) 
//  .then(activities => console.log(activities))


// ActivityModel.getBySearch("HIIT")
// .then(activity => {
//     console.log("Getting the activity record ")
//     console.log(activity)})
//     .catch(error=> 
//         console.error("There was an issue loading the activity: " + error))


////INSERT///////////
// const newActivity = new ActivityModel(null, "Zumba99", "Easy")
// ActivityModel.create(newActivity)
// .then(result => console.log(result))
// .catch(error => console.error(error))


///UPDATE////////

// ActivityModel.getById(14) //retrieve 
// .then(activity =>{
//  activity.name ="HIIT MAX" //change
//  ActivityModel.update(activity) //update
//     .then(result => console.log("The activity is updated in the database. "))
//     .catch(error => console.error("There was as issue updaing the activity in the database"))

// })
// .catch(error => console.error("There was an issue updating the activity: "+error))

////DELETE////////////
// ActivityModel.delete(14)
// .then(result => console.log(result))
// .catch(error => console.error(error))