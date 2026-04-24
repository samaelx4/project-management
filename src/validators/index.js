import { body } from "express-validator";


const userRegisterValidator = ()=>{
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .isLowercase()
            .withMessage("username shoukd be in lowercase")
            .isLength({min: 3})
            .withMessage("Username must be at least 3 charcaters"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),
        body("fullName")
            .optional()
            .trim()
    ]
}

const userLoginValidator = ()=>{
    return [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),
    ]
}

export {userRegisterValidator, userLoginValidator}