import { Request } from "express"
import { Roles } from "../constants"

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
    role: Roles
    tenantId?: number
}

export interface UserRequest extends Request {
    body: UserData
}

export interface AuthRequest extends Request {
    auth: {
        sub: string
        role: string
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

export interface CreateUserRequest extends Request {
    body: UserData
}

export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    tenantId: number;
}

export interface UpdateUserRequest extends Request {
    body: LimitedUserData;
}

export interface UserQueryParams {
    perPage: number;
    currentPage: number;
    q: string;
    role: string;
}

export interface TenantQueryParams {
    q: string;
    perPage: number;
    currentPage: number;
}