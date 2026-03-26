import express from "express"
import { UserModel } from "../../models/UserModel.mjs"
import bcrypt from "bcryptjs"

export class APIAuthenticationController{
    static middleware = express.Router() // router for middleware (Access controls)
    static routes = express.Router()                  //loginorlogout end points

    static{//setup authentication provider
        this.middleware.use(this.#APIAuthenticationProvider)
        this.routes.post("/authenticate", this.handleAuthenticate) //login
        this.routes.delete("/authenticate",APIAuthenticationController.restrict(["any"]), this.handleAuthenticate) //logout

    }
    /**
     * This middleware checks for API key header in the incoming requests
     * and loads the respective user into req.authenticatedUser if found
     * @private
     * @type {express.RequestHandler}

     */
    static async #APIAuthenticationProvider(req, res ,next){ ///middleware
        //does not check if you logged in, but if you  have auth-key load user details
        const authenticationKey = req.headers["x-auth-key"]
        if(authenticationKey){
            try{
                //get user by authentication key
                req.authenticatedUser = await UserModel.getByAuthenticationKey(authenticationKey)
           
            }catch (error){
                if(error == "not found"){
                    res.status(404).json({
                        message: "Failed to authenticate - key not found"
                    })
                } else{
                    console.error(error)
                    res.status(500).json({
                        message: "Failed to authenticate - database error"
                    })
                }
                // Early return here so that next() doesn't run when there was an error
                return // if any of the previous went wrong stop here
            }

        }
        //if not having a key(have anew one),  or having a valid key
        next()
        
           
    }
     
    /**
     * 
     * @type {express.RequestHandler}
     * @openapi
     *  /api/authenticate:
     *      post:
     *          summary: "Authentication with username and password"
     *          tags: [Authentication]
     *          requestBody:
     *              required: true
     *              content:
     *                  application/json:
     *                      schema: 
     *                          $ref: "#components/schemas/UserCredentials" 
     *          responses:
     *              '200':
     *                  $ref: "#components/responses/LoginSuccessful" 
     *              '400':
     *                  $ref: "#components/responses/Error"   
     *              '500':
     *                  $ref: "#components/responses/Error"             
     *      delete:
     *          summary: "Deauthenticate with API key header"
     *          tags: [Authentication]
     *          security:
     *              - ApiKey: [x-]
     *          responses:
     *              '200': 
     *                  $ref: "#components/responses/Updated"
     *              '400':
     *                  $ref: "#components/responses/Error"   
     *              '500':
     *                  $ref: "#components/responses/Error"   
     *              default:
     *                  $ref: "#components/responses/Error"
     *
     * 
     * 
     */
    static async handleAuthenticate(req,res){
       if(req.method == "POST"){
            try{
               const user  =await UserModel.getByUsername(req.body.email)//from user credentials
                
               if(await bcrypt.compare(req.body.password, user.password)){
                // console.log(req.body.password)
                // console.log(user.password)
                // console.log(bcrypt.compare(req.body.password, user.password))
                //set authentication key and 
                // save it to db then send to the client
                const authenticationKey = crypto.randomUUID()
                user.authenticationKey = authenticationKey 
                //console.log(user)    
                const result = await UserModel.updateALL(user)
                
                res.status(200).json({
                    key: authenticationKey
                })

               }else{ //password does not matched
                res.status(400).json({
                    message: "Invalid credentials"
                })

               }
            }catch(error){//can not find user , can't update user,server error
                switch(error){
                    case "not found":
                        res.status(400).json({
                            message: "Invalid credentials"
                        })
                        break;
                    default:
                        console.error(error)
                        res.status(500).json({
                            message: "Failed to authenticate use"
                        })
                        break;
                }

            }

        }else if(req.method == "DELETE"){////CHECKKKKKK
           // req.authenticatedUser check: to logout if logged in
           if(req.authenticatedUser){
            try{
            //Get user , set authKey to null , save back(update user)
            // console.log(req.authenticatedUser)
            // console.log(req.authenticatedUser.authenticationKey)
            const user = await UserModel.getByAuthenticationKey(req.authenticatedUser.authenticationKey)
        
               user.authenticationKey = null
               await UserModel.updateALL(user)

               res.status(200).json({
                message: "Deauthentication successful"
               })
            }catch(error){
                switch(error){
                    case "not found":
                        res.status(400).json({
                            message: "Invalid credentials"
                        })
                        break;
                    default:
                        console.error(error)
                        res.status(500).json({
                            message: "Failed to authenticate use"
                        })
                        break;
                }
                
            }

        }else{// not authenticated user
        res.status(401).json({
            message: "Please login to access the request resources"
             })

            }
        }


    }
    
    /**
     * Allows us to define restricted routes
     * @param {Array<"admin" | "member" | "trainer"> |"any"} allowedRoles 
     * @returns {express.RequestHandler}
     */
    static restrict(allowedRoles){
        return function(req, res, next){
            if(req.authenticatedUser){
                if(allowedRoles == "any" || allowedRoles.includes(req.authenticatedUser.role)){
                    next()
                }else{ // logged in (authenticated) and not authorised
                    res.status(403).json({
                        message: "Access forbidden",
                        errors: ["Role does not have access to the requested resource"]
                    })

                    }
        }else{ // not logged in 
             res.status(401).json({
                message: "Not authenticated",
                errors: ["Please authenticate to access the requested resource"]
            })
        }


    }
}
}