import { Request } from "express"

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface UserRequest extends Request {
    body: UserData
}