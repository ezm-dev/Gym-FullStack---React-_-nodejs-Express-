import { DatabaseModel } from "./DatabaseModel.mjs";

/**
 * class to create UserModel
 * @extends DatabaseModel
 */
export class UserModel extends DatabaseModel {
    /**
     * Create UserModel instance
     * 
     * @param {number} id - userid
     * @param {string} firstName - user's first name
     * @param {string} lastName  -user's last name
     * @param {string} email  - email
     * @param {string} password -user's password
     * @param {string} role - user's role(member, admin, trainer)
     * @param {number} deleted  - indicates if the user is deleted =1,or 0 otherwise
     */
    constructor(id, firstName, lastName, email, password, role, deleted,authenticationKey= null) {
        super()
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.email = email
        this.password = password
        this.role = role
        this.deleted = deleted
        this.authenticationKey= authenticationKey
    }

    /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {UserModel} UserModel instance
     */
    static tableToModel(row) {
        return new UserModel(
            Number(row["id"]),
            row["first_name"],
            row["last_name"],
            row["email"],
            row["password"],
            row["role"],
            row["deleted"],
            row["authentication_key"]
        )

    }
    /**
     * This  function gets the list of all users from database
     * 
     * @returns {Array<UserModel>} list of all users
     */
    static getAll() {
        return this.query(" SELECT * FROM users WHERE deleted = 0")
            //map give list of things , give operation, it does that operation on each item in the list
            .then(results => results.map(row => this.tableToModel(row.users)))
    }

    /**
     * Getting the user by userid
     * @param {number} id 
     * @returns {Promise<UserModel|null>} -UserModel or null otherwise
     */
    static getById(id) {
        return this.query(`SELECT * From users WHERE id= ?`, [id])
            .then(result => result.length > 0 ? this.tableToModel(result[0].users) : Promise.reject("not found")) //trigger catch with error tohandle it


    }

    /**
     * Getting the user by email
     * @param {string} email -user's email
     * @returns {Promise<UserModel|null>} -UserModel or null otherwise
     */
    static getByUsername(email) {
        return this.query(`SELECT * From users WHERE email= ? AND deleted = 0`, [email])
            .then(result => result.length > 0 ? this.tableToModel(result[0].users) : Promise.reject("not found")) //trigger catch with error tohandle it
    }

    /**
     * Getting the user by authenticationKey
     * @param {string} authenticationKey
     * @returns {Promise<UserModel|null>} -UserModel or null otherwise
     */
        static getByAuthenticationKey(key) {
            return this.query(`SELECT * From users WHERE authentication_key= ? AND deleted = 0`, [key])
                .then(result => result.length > 0 ? this.tableToModel(result[0].users) : Promise.reject("not found")) //trigger catch with error tohandle it
        }


    /**
     * Getting the user by role
     * @param {string} role  - the role of the user(admin, member, trainer)
     * @returns {Promise<UserModel|null>} -UserModel or null otherwise
     */
    //get by role to get trainers in sessions Cruds
    static getByRole(role) {
        return this.query(` SELECT * FROM users WHERE deleted = 0 And role=?`, [role])
            .then(results => results.map(row => this.tableToModel(row.users)))
    }
    /**
     * Creating user in the database
     * @param {UserModel} user 
     * @returns {Promise<mysql.QueryResult>}
     */
    static async create(user) {
        return this.query(`INSERT INTO users 
            (first_name, last_name, email, password, role, authentication_key) 
            VALUES(?,?,?,?,?,?)`, [user.firstName, user.lastName, user.email, user.password, user.role, user.authenticationKey])
    }

    /**
     * Updating user in the database
     * @param {UserModel} user
     * @returns {Promise<mysql.OkPacket>}
     */
    static async update(user) {

        return this.query(`UPDATE users SET 
            first_name = ?, last_name = ?, email = ?, password = ?, role =?, authentication_key=?
            WHERE id =? `, [user.firstName, user.lastName, user.email, user.password, user.role,user.authenticationKey,user.id])
    }

    
    /**
     * Updating user in the database(with key)
     * @param {UserModel} user
     * @returns {Promise<mysql.OkPacket>}
     */
    static async updateALL(user) {

        return this.query(`UPDATE users SET 
            first_name = ?, last_name = ?, email = ?, password = ?, role =?, authentication_key = ?
            WHERE id =? `, [user.firstName, user.lastName, user.email, user.password, user.role, user.authenticationKey, user.id])
    }



    


    /**
     * Deleting user(setting the deleted column equals to 1)
     * @param {number} id user id
     * @returns {Promise<mysql.OkPacket>}
     */
    static async delete(id) {
        return this.query(
            `UPDATE users SET deleted = 1 WHERE id = ?`,
            [id]
        )
    }




}

//Testing
// UserModel.getAll()
// .then(users => console.log(users))

//  UserModel.getById(2)
//  .then(users => console.log(users))


// UserModel.getByUsername("e@z.gmail.com")
// .then(user => {
//     console.log("Getting the user record ")
//     console.log(user)})
//     .catch(error=>
//         console.error("There was an issue loading the user: " + error))


//////INSERT///////////
// const newUser = new UserModel(null, "Jack", "Jack22 ", "jack22@gym.com", "abc123","admin")
// UserModel.create(newUser)
// .then(result => console.log(result))
// .catch(error => console.error(error))


///UPDATE////////

// UserModel.getById(3) //retrieve
// .then(user =>{
//  user.firstName ="Mia" //change
//  UserModel.update(user) //update
//     .then(result => console.log("The user is updated in the database. "))
//     .catch(error => console.error("There was as issue updaing the user in the database"))

// })
// .catch(error => console.error("There was an issue updating the user: The user is "+error))

////DELETE////////////
// UserModel.delete(9)
// .then(result => console.log(result))
// .catch(error => console.error(error))