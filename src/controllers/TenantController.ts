import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { TenantQueryParams, TenantRequest } from "../types";
import { Logger } from "winston";
import { matchedData } from "express-validator";

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

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const [tenants, count] = await this.tenantService.getAll(
                validatedQuery as TenantQueryParams,
            );

            this.logger.info("All tenant have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: tenants,
            });

            res.json(tenants);
        } catch (err) {
            next(err);
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