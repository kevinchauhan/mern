import { Repository } from "typeorm";
import { Tenants } from "../entity/Tenant";
import { ITenantData } from "../types";
import createHttpError from "http-errors";

export class TenantService {

    constructor(private tenantRepository: Repository<Tenants>) { }

    async create({ name, address }: ITenantData) {
        try {
            const tenant = await this.tenantRepository.save({ name, address })
            return tenant
        } catch (error) {
            const err = createHttpError(500, 'Failed to store data in db')
            throw err
        }
    }
}