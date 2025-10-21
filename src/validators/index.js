import  {body} from 'express-validator';

const userRegisterValidator = () =>{
    return [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email address'),
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required')
            .isLowercase().withMessage('Username must be in lowercase')
            .isLength({min:3,max:30}).withMessage('Username must be between 3 and 30 characters'),
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isLength({min:6,max:30}).withMessage('Password must be between 6 and 30 characters'),
    ]
}


const userLoginValidator = ()=>{
    return [
        body('email')
            .trim()
            .isEmail().withMessage('Invalid email address'),
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
    ]
}



export {userRegisterValidator,userLoginValidator};