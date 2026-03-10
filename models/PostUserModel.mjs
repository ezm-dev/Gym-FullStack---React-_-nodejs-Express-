import { DatabaseModel } from "./DatabaseModel.mjs";
import { PostModel } from "./PostModel.mjs";
import { UserModel } from "./UserModel.mjs";

/**
 * class to create Join-model of(Posts and Users)
 * @extends DatabaseModel
 */
export class PostUserModel extends DatabaseModel {
    /**
     * 
     * @param {PostModel} post 
     * @param {UserModel} user 
     */
    constructor(post, user) {
        super()
        this.post = post
        this.user = user

    }

     /**
     * This method is used to convert a table row into a model object
     *
     * @param {Object} row - The database table row
     * @returns {PostUserModel} PostUserModel instance
     */
    static tableToModel(row) {
        return new PostUserModel(
            PostModel.tableToModel(row.posts),
            UserModel.tableToModel(row.users)
        )
    }
    
    /**
     * Getting All posts and its users
     * @returns{Array<PostUserModel>} 
     * 
     */
    static getAll() {
        return this.query(`
            select * from posts
            inner join users 
             on posts.user_id = users.id
                and users.deleted = 0
                order by posts.date
            `).then(results => results.map(row => this.tableToModel(row)))
    }


}

//Testing

// PostUserModel.getAll()
//     .then(results => console.log(results))
//     .catch(error => console.log(error))
