import { ValidationError } from "yup"
import { Op } from "sequelize"
import moment from "moment"
import * as helpers from "../../helpers/index.js"
import * as error from "../../middlewares/error.handler.js"
import { User, Shift, Salary, Attendance } from "../../models/relation.js"
import db from "../../database/index.js"
import * as validation from "./validation.js"

// @update profile through invitation link
export const updateProfile = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { token, email, password, fullname, birthdate, joinDate, shiftId } = req.body;
        await validation.UpdateProfileValidationSchema.validate(req.body);

        const user = await User?.findOne({where : {invitationToken : token} });
        if (!user) throw ({ 
            status : error.BAD_REQUEST_STATUS, 
            message : error.USER_DOES_NOT_EXISTS 
        })

        const isExpired = moment().isAfter(user?.dataValues?.tokenExpiration);
        if(isExpired) throw ({status : 400, message : error.INVALID_CREDENTIALS});

        const hashedPassword = helpers.hashPassword(password);        
        await User?.update(
            { 
                email,
                password: hashedPassword,
                fullname,
                birthdate,
                joinDate,
                shiftId,
                invitationToken : null,
                tokenExpiration : null 
            }, 
            { where: { invitationToken : token } }
        );

        // @delete password from response
        delete user?.dataValues?.password;
        delete user?.dataValues?.invitationToken;
        delete user?.dataValues?.tokenExpiration;

        res.status(200).json({ 
            message : "You have updated your password successfully! Please login again!",
            user
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({ 
                status : error.BAD_REQUEST_STATUS , 
                message : error?.errors?.[0] 
            })
        }
        next(error)
    }
}

// @get all shifts
export const getShifts = async (req, res, next) => {
    try {
        const shifts = await Shift?.findAll();

        res.status(200).json({ 
            type: "success", 
            message: "All Shifts Fetched", 
            data: shifts
        });
    } catch (error) {
        next(error)
    }
};

// @get attendance log history
export const getAttendanceLog = async (req, res, next) => {
    try {
        const employeeId = req.employee.id
      // @get query parameters
      const { date, startDate, endDate, page } = req.query;
  
      // @Pagination
      // @maximum Log per page
      const pageSize = 10;
      let offset = 0;
      let limit = pageSize;
      let currentPage = 1;
  
      if (page && !isNaN(page)) {
        currentPage = parseInt(page);
        offset = (currentPage - 1) * pageSize;
      }
  
      let queryOptions = {
        attributes: ["date", "clockIn", "clockOut"], // Add Attendance Log attributes to display
        where : {
            userId : employeeId,
        },
        // include: [
        //   {
        //     model: Shift,
        //     attributes: ["shiftName"],
        //   },
        // ],
        offset,
        limit,
      };
  
      // Filtering based on specific date, start date, and end date
    if (date) {
        queryOptions.where.date = date; // Filter by specific date
      } else if (startDate && endDate) {
        queryOptions.where.date = { [Op.between]: [startDate, endDate] }; // Filter by date range
      }
  
      // Sorting by date in ascending order (can be changed to "DESC" for descending)
      queryOptions.order = [["date", "ASC"]];
  
      const { count, rows: attendances } = await Attendance.findAndCountAll(queryOptions);
  
      const totalPages = Math.ceil(count / pageSize);
  
      // @send response
      res.status(200).json({
        totalAttendances: count,
        attendancesLimit: limit,
        totalPages: totalPages,
        currentPage: currentPage,
        result: attendances,
      });
    } catch (error) {
      next(error);
    }
  };

export const clockIn = async (req, res, next) => {
  try {
    const employeeId = req.employee.id;

    // Check if the employee has already clocked in
    const existingAttendance = await Attendance.findOne({
      where: {
        userId : employeeId,
        date: moment().format("YYYY-MM-DD"), // Today's date
        clockIn: { [Op.not]: null }, // Check if clockIn is not null (already clocked in)
      },
    });

    if (existingAttendance) {
      throw {
        status: error.BAD_REQUEST_STATUS,
        message: "You have already clocked in today.",
      };
    }

    // Clock in the employee
    const attendance = await Attendance.create({
        userId : employeeId,
      date: moment().format("YYYY-MM-DD"), // Today's date
      clockIn: moment().format("HH:mm:ss"), // Current time
    });

    res.status(200).json({
      message: "Clock-in successful!",
      attendance
    });
  } catch (error) {
    next(error);
  }
};

export const clockOut = async (req, res, next) => {
  try {
    const employeeId = req.employee.id

    // Check if the employee has already clocked out
    const existingAttendance = await Attendance.findOne({
      where: {
        userId : employeeId,
        date: moment().format("YYYY-MM-DD"), // Today's date
        clockOut: { [Op.not]: null }, // Check if clockOut is not null (already clocked out)
      },
    });

    if (existingAttendance) {
      throw {
        status: error.BAD_REQUEST_STATUS,
        message: "You have already clocked out today.",
      };
    }

    // Clock out the employee
    const attendance = await Attendance.update(
      {
        clockOut: moment().format("HH:mm:ss"), // Current time
      },
      {
        where: {
            userId : employeeId,
          date: moment().format("YYYY-MM-DD"), // Today's date
          clockOut: null, // Check if clockOut is null (not yet clocked out)
        },
      }
    );

    res.status(200).json({
      message: "Clock-out successful!",
      attendance
    });
  } catch (error) {
    next(error);
  }
};

export const getPayrollReport = async (req, res, next) => {
  try {
    const employeeId = req.employee.id
    const { startDate, endDate } = req.query; // pass the start and end dates from the frontend

    // Retrieve employees, their details, and attendance data for the specified date range
    const employees = await User.findAll({
      include: [
        {
          model: Salary,
        },
        {
          model: Attendance,
          where: {
            userId : employeeId,
            date: {
              [Op.between]: [startDate, endDate],
            },
          },
        },
      ],
    });

    // Calculate and prepare the payroll report for each employee
    const payrollReport = employees.map((employee) => {
      const { salary } = employees.Salary;
      const dailySalary = salary / 30;
      let deductions = 0;

      // Calculate earnings and deductions based on attendance data
      employee.Attendances.forEach((attendance) => {
        const { clockIn, clockOut } = attendance;

        if (!clockIn && !clockOut) {
          deductions += dailySalary; // Deduct full day salary for missing clock-in and clock-out
        } else if (clockIn && !clockOut) {
          deductions += dailySalary / 2; // Deduct half day salary for missing clock-out
        }
      });

      // Calculate net salary after deductions
      const netSalary = salary - deductions;

      return {
        employeeId: employee.id,
        fullName: employee.fullName,
        salary: salary,
        deductions: deductions,
        netSalary: netSalary,
      };
    });

    res.status(200).json({
      type: "success",
      message: "Payroll report generated successfully!",
      data: payrollReport,
    });
  } catch (error) {
    next(error);
  }
};

