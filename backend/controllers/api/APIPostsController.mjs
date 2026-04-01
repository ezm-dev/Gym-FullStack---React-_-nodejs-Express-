import express from "express"
import { PostModel } from "../../models/PostModel.mjs"
import { PostUserModel } from "../../models/PostUserModel.mjs"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"


export class APIPostsController{
    static routes = express.Router()

    static{
        this.routes.post("/",APIAuthenticationController.restrict(["any"]),this.createPost)
       this.routes.get("/", this.getPosts)
       this.routes.delete("/:id",APIAuthenticationController.restrict(["any"]), this.deletePost)

    }
    
    /**
     * Handle creating a new post
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/posts:
     *   post:
     *     summary: "Create a new post"
     *     tags: [Posts]
     *     security:
     *       - ApiKey: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/Post"
     *     responses:
     *       '200':
     *         $ref: "#/components/responses/Created"
     *       '403':
     *         $ref: "#/components/responses/Error"
     *       '500':
     *         $ref: "#/components/responses/Error"
     *       default:
     *         $ref: "#/components/responses/Error"
     */
    static async createPost(req, res) {
        try {
          //check if user id is authentictedUser.id before creating post
            if (req.body.userId != req.authenticatedUser.id) {
                res.status(403).json({
                    message: "Access forbidden! - Failed to create post."
                })

                return //stop and return
            }
            

            const post = new PostModel(
                req.body.id,
                req.authenticatedUser.id,
                req.body.title,
                req.body.content,
                new Date().toLocaleDateString("en-CA") //today's date
            )
           // console.log(post)

            const result = await PostModel.create(post)

            res.status(200).json({
                id: result.insertId,
                message: "post created"
            })
        } catch (error) {
            res.status(500).json({
                message: "Failed to create post",
                errors: [error]
            })
        }
    }

    /**
     * Handle getting all posts with associated user information
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/posts:
     *   get:
     *     summary: "Get the list of all posts with user details"
     *     tags: [Posts]
     *     responses:
     *       '200':
     *         description: 'List of posts with associated users'
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: "#/components/schemas/PostWithUser"
     *       '500':
     *         $ref: "#/components/responses/Error"
     */

    static async getPosts(req, res) {
        try {//we can use PostModel instead of PostUserModel
            const posts =  await PostUserModel.getAll()
            res.status(200).json(posts)
        } catch (error) {
            res.status(500).json({
                message: "Failed to load posts from database",
                errors: [error]
            })
        }
    }


    /**
     * @openapi
     * /api/posts/{id}:
     *   delete:
     *     summary: Delete a post by ID
     *     description: Deletes a post by its unique identifier.
     *     tags: [Posts]
     *     security:
     *       - ApiKey: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the post to delete
     *     responses:
     *       200:
     *         $ref: '#/components/responses/Deleted'
     *       404:
     *         description: Post not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               required:
     *                 - message
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Post not found - delete failed"
     *       '403':
     *         $ref: "#/components/responses/Error"
     *       '500':
     *         $ref: '#/components/responses/Error'
     */
    static async deletePost(req, res) {
        try {
            //check if user delete his own posts
            const post =await PostModel.getById(req.params.id)
            if (post.userId != req.authenticatedUser.id) {
                res.status(403).json({
                    message: "Access forbidden! - Failed to delete post."
                })

                return //stop and return
            }
            const result = await PostModel.delete(req.params.id)

            if (result.affectedRows == 1) {
                res.status(200).json({
                    message: "Post deleted"
                })
            } else {
                res.status(404).json({
                    message: "Post not found - delete failed",
                })
            }

        } catch (error) {
            if(error == "not found"){
                res.status(404).json({
                message: "Post not found - delete failed",
                })
                return
            }
            res.status(500).json({
                message: "Failed to delete post",
                errors: [error]
            })
        }
    }

}