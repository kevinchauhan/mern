import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import { TenantRequest } from "../types";
import { Logger } from "winston";

export class TenantController {

    constructor(private tenantService: TenantService, private logger: Logger) { }

    async create(req: TenantRequest, res: Response, next: NextFunction) {
        try {
            const { name, address } = req.body

            this.logger.debug('New request to create tenant', req.body)

            const tenant = await this.tenantService.create({ name, address })

            this.logger.info('Tenant has been created', { id: tenant.id })

            res.status(201).json({ id: tenant.id })
        } catch (error) {
            next(error)
        }
    }

    async getAll(req: TenantRequest, res: Response, next: NextFunction) {
        try {
            const tenant = await this.tenantService.getAll()
            res.status(200).json({ tenant })
        } catch (error) {
            next(error)
        }
    }

    async getSingle(req: TenantRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params
            const tenant = await this.tenantService.findById(Number(id))
            res.status(200).json({ tenant })
        } catch (error) {
            next(error)
        }
    }

    async update(req: TenantRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params
            const { name, address } = req.body
            const tenant = await this.tenantService.update(Number(id), { name, address })
            res.status(200).json({ tenant })
        } catch (error) {
            next(error)
        }
    }

    async remove(req: TenantRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params
            const tenant = await this.tenantService.remove(Number(id))
            res.status(200).json({ tenant })
        } catch (error) {
            next(error)
        }
    }
}