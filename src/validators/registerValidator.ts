import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: 'email is missing',
        trim: true,
        notEmpty: true,
        isEmail: {
            errorMessage: 'invalid email'
        }
    },
    firstName: {
        errorMessage: 'first name is missing',
        trim: true,
        notEmpty: true
    },
    lastName: {
        errorMessage: 'last name is missing',
        trim: true,
        notEmpty: true
    },
    password: {
        errorMessage: 'password is missing',
        trim: true,
        notEmpty: true
    }
});