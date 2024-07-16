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
}