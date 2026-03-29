import express from "express"
import { SessionModel } from "../../models/SessionModel.mjs"
import { SessionALTModel } from "../../models/SessionALTModel.mjs"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"
import { ActivityModel } from "../../models/ActivityModel.mjs"

// TEST///////////////////////////////////////////////////


export class APISessionController{
    static routes = express.Router()

    static{
        

      this.routes.get("/",APIAuthenticationController.restrict(["trainer"]) ,this.getSessions)
      this.routes.get("/calendar",APIAuthenticationController.restrict(["member"]) ,this.getSessionsCalendar) 
      this.routes.patch("/activities/:id",APIAuthenticationController.restrict(["admin"]),this.updateActivity)
      // this.routes.get("/calendar",this.getSessionsCalendar) 
    }

 



    /**
     * Handle getting all sessions (optionally filtered by activity)
     *
     * @type {express.RequestHandler}
     * @openapi
     * /api/sessions:
     *   get:
     *     summary: "Get all sessions or filter sessions by (Trainer Id)"
     *     tags: [Sessions]
     *     security:
     *         - ApiKey: [x-]   
     *     parameters:
     *       - name: id
     *         in: query
     *         description: Filter sessions by trainer Id
     *         required: false
     *         schema:
     *           type: number
     *           example: 1
     *     responses:
     *       '200':
     *         description: "List of sessions with related data"
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 required:
     *                   - session
     *                   - activity
     *                   - location
     *                   - user
     *                 properties:
     *                   session:
     *                     $ref: "#/components/schemas/SessionALT"
     *                   activity:
     *                     $ref: "#/components/schemas/Activity"
     *                   location:
     *                     $ref: "#/components/schemas/Location"
     *                   user:
     *                     $ref: "#/components/schemas/UserALT"
     *       '500':
     *         $ref: "#/components/responses/Error"
     *       default:
     *         $ref: "#/components/responses/Error"
     */
    static async getSessions(req,res){
        try{
            const sessions = req.query.id?
            await SessionALTModel.getSessionsByTrainerId(req.query.id):
            await SessionALTModel.getAll()
           // console.log(sessions)
            res.status(200).json(sessions)

        }catch(error){
            console.error(error)
            res.status(500).json({
                message: "Failed to load sessions from database",
                //errors: [error] bad idea  for real world
            })

        }

    }


    /**
     * Handle getting sessions within a date range for calendar view
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/sessions/calendar:
     *   get:
     *     summary: "Get sessions within a date range for calendar view (members only)"
     *     tags: [Sessions]
     *     security:
     *         - ApiKey: [x-]  
     *     parameters:
     *       - name: start_date
     *         in: query
     *         description: The start date to filter sessions by
     *         required: false
     *         schema:
     *           type: string
     *           format: date
     *           example: 2025-05-01
     *       - name: end_date
     *         in: query
     *         description: The end date to filter sessions by
     *         required: false
     *         schema:
     *           type: string
     *           format: date
     *           example: 2025-05-30
     *       - name: select_date
     *         in: query
     *         description: Specific date to filter sessions by (used if start_date and end_date are not provided)
     *         required: false
     *         schema:
     *           type: string
     *           format: date
     *           example: 2025-05-12
     *       - name: select_activity
     *         in: query
     *         description: Activity name to filter sessions by (with date filter)
     *         required: false
     *         schema:
     *           type: string
     *           example: "HIIT"
     *     responses:
     *       '200':
     *         description: "List of sessions within the date range or matching the date and activity"
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 required:
     *                   - session
     *                   - activity
     *                   - location
     *                   - user
     *                 properties:
     *                   session:
     *                     $ref: "#/components/schemas/SessionALT"
     *                   activity:
     *                     $ref: "#/components/schemas/Activity"
     *                   location:
     *                     $ref: "#/components/schemas/Location"
     *                   user:
     *                     $ref: "#/components/schemas/UserALT"
     *       '400':
     *         $ref: "#/components/responses/Error"
     *       '500':
     *         $ref: "#/components/responses/Error"
     *       default:
     *         $ref: "#/components/responses/Error"
     */

    static async getSessionsCalendar(req, res) {
        try {

            const sessionsCalendar = (req.query.start_date && req.query.end_date)?
               await SessionALTModel.getSessionBetweenDates(req.query.start_date ,req.query.end_date)
            // await SessionALTModel.getSessionBetweenDates("2025-05-16","2025-05-30")
            :await SessionALTModel.getByDateAndActivity(req.query.select_date,req.query.select_activity)
           // console.log(sessionsCalendar)
            res.status(200).json(sessionsCalendar)
        } catch (error) {
            res.status(500).json({
                message: "Failed to load sessions calendar from database",
                errors: [error]
            })
        }
}


/**
 * Handle updating an existing activity(trainer, admin only)
 *
 * @type {express.RequestHandler}
 * @openapi
 * /api/sessions/activities/{id}:
 *   patch:
 *     summary: Update an existing activity by ID(admins only)
 *     tags: [Sessions]
 *     security:
 *         - ApiKey: [x-]  
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Activity ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 8
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ActivityEdit"
 *     responses:
 *       '200':
 *         $ref: "#/components/responses/Updated"
 *       '404':
 *         $ref: "#/components/responses/NotFound"            
 *       '500':
 *         $ref: "#/components/responses/Error"
 *       default:
 *         $ref: "#/components/responses/Error"
 */
    static async updateActivity(req,res){ 
        try {
       
            const activity = new ActivityModel(
                req.params.id, //id from params
                req.body.name,
                req.body.description,
                req.body.deleted
        
            )
            //console.log(activity)

            const result = await ActivityModel.update(activity)

            if (result.affectedRows == 1) {
                res.status(200).json({
                    message: "activity updated"
                })
            } else {
                res.status(404).json({
                    message: "activity not found - update failed",
                })
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Failed to update activity",
                errors: [error]
            })
        }
        
    }




}