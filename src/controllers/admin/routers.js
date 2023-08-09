import { Router } from "express"
import { verifyAdmin } from "../../middlewares/index.js"
// @import the controller
import * as AdminControllers from "./index.js"

// @define routes
const router = Router()

router.get("/", verifyAdmin, AdminControllers.getAllEmployees)
router.post("/create", verifyAdmin, AdminControllers.createEmployee)
router.get("/shift", verifyAdmin, AdminControllers.getShifts)

export default router
