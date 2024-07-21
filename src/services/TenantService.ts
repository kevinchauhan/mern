import { Repository } from "typeorm";
import { Tenants } from "../entity/Tenant";
import { ITenantData, TenantQueryParams } from "../types";
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

    async getAll(validatedQuery: TenantQueryParams) {
        const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                "CONCAT(tenant.name, ' ', tenant.address) ILike :q",
                { q: searchTerm },
            );
        }

        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy("tenant.id", "DESC")
            .getManyAndCount();
        return result;
    }
    async findById(id: number) {
        try {
            const tenant = await this.tenantRepository.findOne({ where: { id } })
            return tenant
        } catch (error) {
            const err = createHttpError(500, 'Failed to fetch data from db')
            throw err
        }
    }

    async update(id: number, data: ITenantData) {
        try {
            const tenant = await this.tenantRepository.update(id, data)
            return tenant
        } catch (error) {
            const err = createHttpError(500, 'Failed to update data in db')
            throw err
        }
    }

    async remove(id: number) {
        try {
            const tenant = await this.tenantRepository.delete(id)
            return tenant
        } catch (error) {
            const err = createHttpError(500, 'Failed to update data in db')
            throw err
        }
    }
}