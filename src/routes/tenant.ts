import { Router } from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { Tenants } from "../entity/Tenant";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";

const router = Router()

const userRepository = AppDataSource.getRepository(Tenants)
const tenantService = new TenantService(userRepository)
const tenantController = new TenantController(tenantService, logger)

router.post('/', (req, res, next) => tenantController.create(req, res, next))

export default router