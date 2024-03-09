import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: 'email is missing',
        trim: true,
        notEmpty: true,
    },
    password: {
        errorMessage: 'password is missing',
        trim: true,
        notEmpty: true,
    }
});