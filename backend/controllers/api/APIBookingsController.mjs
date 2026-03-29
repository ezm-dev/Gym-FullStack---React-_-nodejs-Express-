import express from "express"
import { BookingModel } from "../../models/BookingModel.mjs"
import { BookingsDetailsModel } from "../../models/BookingsDetailsModel.mjs"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"



export class APIBookingsController{
    static routes = express.Router() 

    static{
        
        this.routes.post("/",APIAuthenticationController.restrict(["member"]),this.createBooking)
        this.routes.get("/",APIAuthenticationController.restrict(["member"]) ,this.getBookings)
       this.routes.delete("/:id",APIAuthenticationController.restrict(["member"]) ,this.deleteBooking)
       

    }


    /**
     * Handle creating a new booking
     *
     * @type {express.RequestHandler}
     * @openapi
     * /api/bookings:
     *   post:
     *     summary: "Create a new booking"
     *     tags: [Bookings]
     *     security:
     *         - ApiKey: [x-]  
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/BookingInput"
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
    static async createBooking(req,res){
        try{
            //check userId is authenticatedUSer before creating
            if ( req.body.userId != req.authenticatedUser.id) {
                res.status(403).json({
                    message: "Access forbidden! - Failed to create booking."
                })

                return
            }

            const booking = new BookingModel(
                null, //It should be null
                req.authenticatedUser.id,
                req.body.sessionId,
                new Date().toLocaleDateString("en-CA")
            )

            const result = await BookingModel.create(booking)

            res.status(200).json({
                id: result.insertId,
                message: "Booking created"
            })
        }catch (error) {
            res.status(500).json({
                message: "Failed to create booking",
                errors: [error]
            })
        }
    }



    /**
     * Handle getting all booking details
     *
     * @type {express.RequestHandler}
     * @openapi
     * /api/bookings:
     *   get:
     *     summary: "Get all booking or filter bookings by (Member Id) "
     *     tags: [Bookings]
     *     security:
     *         - ApiKey: [x-]
     *     parameters:
     *       - name: id
     *         in: query
     *         description:  Filter bookings by member Id
     *         required: false
     *         schema:
     *           type: number
     *           example: 10
     *     responses:
     *       '200':
     *         description: "List of booking details"
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: "#/components/schemas/BookingDetails"
     *       '500':
     *         $ref: "#/components/responses/Error"
     *       default:
     *         $ref: "#/components/responses/Error"
     */
    static async getBookings(req,res){
        try{
            
            const bookings = req.query.id?
            await BookingsDetailsModel.getBookingsDetailsByMemberId(req.query.id)
            :await BookingsDetailsModel.getAllBookingDetails()
            res.status(200).json(bookings)
        }catch (error){
            res.status(500).json({
                message: "Failed to load bookings from database",
                errors: [error]
            })
        }
    }


    /**
     * @openapi
     * /api/bookings/{id}:
     *   delete:
     *     tags: [Bookings]
     *     security:
     *         - ApiKey: [x-]   
     *     summary: Delete a booking by ID
     *     description: Deletes a booking identified by ID.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *           example: 1
     *         description: The ID of the booking to delete
     *     responses:
     *       200:
     *         $ref: '#/components/responses/Deleted'
     *       403:
     *         $ref: '#/components/responses/Error'
     *       404:
     *         $ref: '#/components/responses/NotFound'        
     *       500:
     *         $ref: '#/components/responses/Error'
     *       default:
     *         $ref: '#/components/responses/Error'
     */
    static async deleteBooking(req, res) {
        try {
            //check if user delete his own booking
            const booking =await BookingModel.getById(req.params.id)
            if (booking.userId != req.authenticatedUser.id) {
                res.status(403).json({
                    message: "Access forbidden! - Failed to delete booking."
                })

                return //stop and return
            }

            const result = await BookingModel.delete(req.params.id)

            if (result.affectedRows == 1) {
                res.status(200).json({
                    message: "booking deleted"
                })
            } else {
                res.status(404).json({
                    message: "Booking not found - delete failed",
                })
            }

        } catch (error) {
            if(error == "not found"){
                   res.status(404).json({
                    message: "Booking not found - delete failed",
                })

            }
            res.status(500).json({
                message: "Failed to delete booking",
                errors: [error]
            })
        }
    }

}
