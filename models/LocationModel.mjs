import { DatabaseModel } from "./DatabaseModel.mjs";

/**
 * class to create LocationModel
 */

export class LocationModel extends DatabaseModel{
    /**
     * Create LocationModel instance
     * @param {number} id -location id
     * @param {string} name  -location name
     * @param {string} address -location address
     * @param {*} deleted - indicates if the user is deleted =1,or 0 otherwise
     */
    constructor (id, name, address, deleted){
        super()
        this.id = id
        this.name = name 
        this.address = address
        this.deleted = deleted
   
    }
      
     /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {UserModel} UserModel instance
     */
       //take tabel  row and convert to model object(db --> js)
       static tableToModel(row){
        return new LocationModel(
            row["id"],
            row["name"], 
            row["address"] ,
            row["deleted"]
        )

    }

     /**
     * This  function gets the list of all locations from database
     * 
     * @returns {Array<LocationModel>} list of all locations
     */

    static getAll(){
        return this.query(" SELECT * FROM locations WHERE deleted = 0")
        //map give list of things , give operation, it does that operation on each item in the list
        .then(results => results.map(row => this.tableToModel(row.locations)))
    }



    /**
     * Getting the location by id
     * @param {number} id 
     * @returns {Promise<LocationModel|null>} -LocationModel or null otherwise
     */
    static getById(id){
        return this.query("SELECT * From locations WHERE id= ?",[id])
        .then(result => result.length > 0?this.tableToModel(result[0].locations):Promise.reject("not found")) //trigger catch with error tohandle it
        

    }

     /**
      * Creating location in the database
      * @param {LocationModel} location 
      * @returns {Promise<mysql.QueryResult>}
      */
    static async create(location){
        return this.query(`INSERT INTO locations
            (name, address) 
            VALUES(?,?)`,[location.name,  location.address])
    }


    /**
     * Updating location in the database
     * @param {LocationModel} location 
     * @returns {Promise<mysql.QueryResult>}
     */
    static async update(location){
        return this.query(`UPDATE locations SET 
            name= ?, address = ?
            WHERE id =? `, [location.name, location.address, location.id] )
    }

   
     /**
     * Deleting location(setting the deleted column equals to 1)
     * @param {number} id location id
     * @returns {Promise<mysql.OkPacket>}
     */
    static delete(id) {
        return this.query(
            `UPDATE locations SET deleted = 1 WHERE id = ?`,
            [id]
        )
    }

}


//Testing
// LocationModel.getAll()
// .then(locations => console.log(locations))

// LocationModel.getById(2) 
//  .then(locations => console.log(locations))



// //INSERT///////////
// const newlocation = new LocationModel(null, "Algester", "Algester....")
// LocationModel.create(newlocation)
// .then(result => console.log(result))
// .catch(error => console.error(error))


///UPDATE////////

// LocationModel.getById(6) //retrieve 
// .then(location =>{
//  location.name ="TEST" //change
//  LocationModel.update(location) //update
//     .then(result => console.log("The location is updated in the database. "))
//     .catch(error => console.error("There was as issue updaing the location in the database"))

// })
// .catch(error => console.error("There was an issue updating the location: "+error))

//DELETE////////////
// LocationModel.delete(6)
// .then(result => console.log(result))
// .catch(error => console.error(error))