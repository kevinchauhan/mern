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

export interface AuthRequest extends Request {
    auth: {
        sub: string
        role: number
        id?: string
    }
}

export type AuthCookie = {
    accessToken: string
    refreshToken: string
}

export interface IRefreshTokenPayload {
    id: string
}

export interface ITenantData {
    name: string
    address: string
}

export interface TenantRequest extends Request {
    body: ITenantData
}