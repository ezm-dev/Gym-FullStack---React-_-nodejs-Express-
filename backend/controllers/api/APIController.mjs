import express from "express"
import { APISessionController } from "./APISessionsController.mjs"
import { APIBookingsController } from "./APIBookingsController.mjs"
import swaggerUI from "swagger-ui-express"
import *as ApiValidator from "express-openapi-validator"
import swaggerJSDoc from "swagger-jsdoc"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"
import { APIUsersController } from "./APIUsersController.mjs"
import { APIPostsController } from "./APIPostsController.mjs"
import { APIXMLController } from "./APIXMLController.mjs"




const options = {
    failsOnErrors: true, //give error incase of syntax error
    definition: {
        openapi:"3.0.0",  //open api version
        info: {
            version: "1.0.0",   //my api version
            title: "Gym API", 
            description: "JSON REST API for interacting with the Gym backend"   
        },
        components: {  //security
            securitySchemes: {
                ApiKey: {
                    type: "apiKey",
                    in: "header",
                    name: "x-auth-key"
                }
            }
        }, 
    },
    apis: ["./controllers/**/*.{js,mjs,yaml}","./components.yaml"] //where to find apis
}

const specification = swaggerJSDoc(options) // 1-contains open Api specifications based on options and reading files

console.log(JSON.stringify(specification))



export class APIController{
   static  routes = express.Router()

   static{
   
   //setup doc pages (swaggerUI for specifications)
   /**
    * @openapi
    *   /api/docs:
    *       get:
    *           summary: "View automaticallly genrated documentation pages"
    *           tags: [Documentation]
    *           responses:
    *               '200': 
    *                   description: "The documentation page"
    */
    this.routes.use("/docs", swaggerUI.serve, swaggerUI.setup(specification))
   
//setup validator
   this.routes.use(ApiValidator.middleware({
    apiSpec: specification,
    validateRequests: true,
    validateResponses: true
   }))

//setup error resonse handeling(in JSON format) //pick validation errors
   this.routes.use((err, req, res, next)=>{
    res.status(err.status || 500).json({
       //status: err.status,    //check
        messsage: err.message,
        errors: err.errors
    })
 })



//API middleware and authentication controller endpoints
//middleware look for apikey header & find details about you
//routes post/delete api-keys

  this.routes.use(APIAuthenticationController.middleware)
  this.routes.use(APIAuthenticationController.routes) //i don't put "", as i don't want under sub-directory(No api/authentication/authenticate  )
//if you want to put something in root don't put anything before it

//add API controllers
this.routes.use("/sessions", APISessionController.routes)
this.routes.use("/bookings",APIBookingsController.routes)
this.routes.use("/posts",APIPostsController.routes)
this.routes.use("/users",APIUsersController.routes)
this.routes.use("/xml",APIXMLController.routes) 


}
}

