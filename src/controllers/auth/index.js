import { ValidationError } from "yup"
import handlebars from "handlebars"
import fs from "fs"
import path from "path"
import moment from "moment"

import * as config from "../../config/index.js"
import * as helpers from "../../helpers/index.js"
import * as error from "../../middlewares/error.handler.js"
import { User } from "../../models/models.js"
import db from "../../database/index.js"
import * as validation from "./validation.js"

// @register admin
export const register = async (req, res, next) => {
    try {
        // @create transaction
        const transaction = await db.sequelize.transaction();
        
        // @validation
        const { email, password } = req.body;
        await validation.RegisterValidationSchema.validate(req.body);

        // @check if user already exists
        const userExists = await User?.findOne({ where: { email } });
        if (userExists) throw ({ status : 400, message : error.USER_ALREADY_EXISTS });

        // @create user -> encypt password
        const hashedPassword = helpers.hashPassword(password);

        // @archive user data
        const user = await User?.create({
            email,
            password : hashedPassword,
            role : 1
        });

        // @delete unused data from response
        delete user?.dataValues?.password;
        delete user?.dataValues?.invitation_token;
        delete user?.dataValues?.token_expiration;
       
        // @generate access token
        const accessToken = helpers.createToken({ id: user?.dataValues?.id, role : user?.dataValues?.role });

        // @send response
        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({
                message: "Admin created successfully",
                user
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

// @login process
export const login = async (req, res, next) => {
    try {
        // @validation, we assume that username will hold either username or email
        const { username, password } = req.body;
        await validation.LoginValidationSchema.validate(req.body);

        // @check if username is email
        const isAnEmail = await validation.IsEmail(username);
        const query = isAnEmail ? { email : username } : { username };

        // @check if user exists
        const userExists = await User?.findOne({ where: query });
        if (!userExists) throw ({ status : 400, message : error.USER_DOES_NOT_EXISTS })

        // @check if user is disable
        if (userExists?.dataValues?.isDisable === 1) throw ({ status : 400, message : error.CASHIER_IS_DISABLE });

        // @check if password is correct
        const isPasswordCorrect = helpers.comparePassword(password, userExists?.dataValues?.password);
        if (!isPasswordCorrect) throw ({ status : 400, message : error.INVALID_CREDENTIALS });

        // @generate access token
        const accessToken = helpers.createToken({ uuid: userExists?.dataValues?.uuid, role : userExists?.dataValues?.role });

        // @delete password from response
        delete userExists?.dataValues?.password;
        delete userExists?.dataValues?.otp;
        delete userExists?.dataValues?.expiredOtp;

        // @return response
        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({ user : userExists })
    } catch (error) {
        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @keeplogin
export const keepLogin = async (req, res, next) => {
    try {
        // @get user id from token
        const { uuid } = req.user;

        // @get user data
        const user = await User?.findOne({ where : { uuid } });

        // @delete password from response
        delete user?.dataValues?.password;
        delete user?.dataValues?.otp;
        delete user?.dataValues?.expiredOtp;

        // @return response
        res.status(200).json({ user })
    } catch (error) {
        next(error)
    }
}
