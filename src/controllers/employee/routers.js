import { Router } from "express"
import { verifyEmployee } from "../../middlewares/index.js"
// @import the controller
import * as EmployeeControllers from "./index.js"

// @define routes
const router = Router()

router.patch("/update-profile", EmployeeControllers.updateProfile)
router.get("/shift", verifyEmployee, EmployeeControllers.getShifts)
router.get("/history", verifyEmployee, EmployeeControllers.getAttendanceLog)
router.post("/log/clock-in", verifyEmployee, EmployeeControllers.clockIn)
router.post("/log/clock-out", verifyEmployee, EmployeeControllers.clockOut)
router.get("/payroll-report", verifyEmployee, EmployeeControllers.getPayrollReport)

export default router