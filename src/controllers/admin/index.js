import { ValidationError } from "yup"
import handlebars from "handlebars"
import fs from "fs"
import path from "path"
import moment from "moment"
import { Op } from 'sequelize';

import * as config from "../../config/index.js"
import * as helpers from "../../helpers/index.js"
import * as error from "../../middlewares/error.handler.js"
import { User, Shift, Salary } from "../../models/relation.js"
import db from "../../database/index.js"
import * as validation from "./validation.js"

// @admin create employee
export const createEmployee = async (req, res, next) => {
    // @create transaction
    const transaction = await db.sequelize.transaction();
    try {        
        // @validation
        const { email, password, fullname, birthdate, joinDate, shiftId, salary } = req.body;
        await validation.CreateEmployeeValidationSchema.validate(req.body);

        // @check if employee already exists
        const userExists = await User?.findOne({ where: { email } });
        if (userExists) throw ({ status : 400, message : "Employee already exists." });

        // @create employee -> encypt password
        const hashedPassword = helpers.hashPassword(password);

        // @archive employee data
        const user = await User?.create({
            email,
            password : hashedPassword,
            fullname,
            birthdate,
            joinDate,
            shiftId,
            roleId : 2
        });
        
        const userSalary = await Salary?.create({
            userId: user?.dataValues?.id,
            salary
        })

        // @delete unused data from response
        delete user?.dataValues?.password;
        delete user?.dataValues?.invitaionToken;
        delete user?.dataValues?.tokenExpiration;

        // @generate access token
        const accessToken = helpers.createToken({ id: user?.dataValues?.id, roleId : user?.dataValues?.roleId });
        await User?.update({
            invitaionToken : accessToken, 
            tokenExpiration : moment().add(1,"days").format("YYYY-MM-DD HH:mm:ss")},{where : {email : email}})

        const template = fs.readFileSync(path.join(process.cwd(), "templates", "invitation.html"), "utf8");

        const message = handlebars.compile(template)({link : config.REDIRECT_URL+`/employee/update-profile/${accessToken}`})

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Admin invited you to Attend App",
            html: message
        }

        helpers.transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        // @send response
        res.status(200)
            .json({
                type: "success",
                message: "Employee created successfully. The invitation link has been sent to the new employee's email!",
                user, userSalary
            });

        // @commit transaction
        await transaction.commit();
    } catch (error) {
        // @rollback transaction
        await transaction.rollback();

        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @get all employees
export const getAllEmployees = async (req, res, next) => {
    try {
        const employees = await User?.findAll({ 
            where : {roleId : 2},
            attributes : { exclude : ["password", "invitationToken","tokenExpiration"]}  
        });

        const total = await User?.count({ where : { roleId : 2 } });

        res.status(200).json({ 
            type: "success", 
            message: "All Data Employees Fetched", 
            data: {
                totalemployees: total,
                employees
            }
        });
    } catch (error) {
        next(error)
    }
};

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
