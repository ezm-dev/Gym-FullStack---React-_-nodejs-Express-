import { DatabaseModel } from "./DatabaseModel.mjs";


/**
 * class to create PostModel
 * @extends DatabaseModel
 */
export class PostModel extends DatabaseModel{
    /**
     * Create PostModel instance
     * @param {number} id -post id
     * @param {number} userId -userid
     * @param {string} title -post title
     * @param {string} content -post content
     * @param {date} date -post date
     */
    constructor (id, userId, title, content,date){
        super()
        this.id = id
        this.userId = userId
        this.title = title
        this.content = content
        this.date = date
   
    }
      
    
    /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {PostModel} PostModel instance
     */
       static tableToModel(row){
        return new PostModel(
            row["id"],
            row["user_id"], 
            row["title"],
            row["content"],
            row["date"]
        )

    }
   /**
    * Getting the list of all posts from database
    * @returns {Array<PostModel>} list of all posts
    */
    static getAll(){
        return this.query(" SELECT * FROM posts ")
        //map give list of things , give operation, it does that operation on each item in the list
        .then(results => results.map(row => this.tableToModel(row.posts)))
    }



 /**
     * Getting the post by userid
     * @param {number} id 
     * @returns {Promise<UserModel|null>} -PostModel or null otherwise
     */
    static getById(id){
        return this.query("SELECT * From posts WHERE id= ?",[id])
        .then(result => result.length > 0?this.tableToModel(result[0].posts):Promise.reject("not found")) //trigger catch with error tohandle it
        

    }
   
    
    /**
     * Creating post in database
     * @param {PostModel} post
     * @returns {Promise<mysql.OkPacket>}
     */
    static async create(post){
        return this.query(`INSERT INTO posts
            (user_id, title, content, date) 
            VALUES(?,?,?,?)`,[post.userId, post.title, post.content, post.date])
    }


     /**
    * Deleting post from the database
    * @param {number} id 
    * @returns {Promise<mysql.OkPacket>} 
    */

    static async delete(id) {
        return this.query("DELETE FROM posts WHERE id =?", [id])
        .then(result => result.affectedRows >0 ? result :Promise.reject("not found") )
    }


}


//Testing
// PostModel.getAll()
// .then(posts => console.log(posts))

//  PostModel.getById(2) 
//  .then(posts => console.log(posts))
    




////INSERT///////////
//  const post= new PostModel(null,5, "mytitle", "COntent222", "2025-02-05")
// PostModel.create(post)
// .then(result => console.log(result))
// .catch(error => console.error(error))


///UPDATE////////

// PostModel.getById(4) //retrieve 
// .then(post =>{
//  post.title ="NEW NEW" //change
//  PostModel.update(post) //update
//     .then(result => console.log("The post is updated in the database. "))
//     .catch(error => console.error("There was as issue updaing the post in the database"))

// })
// .catch(error => console.error("There was an issue updating the post: "+error))

////DELETE////////////

