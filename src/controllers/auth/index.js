import { ValidationError } from "yup"
import * as helpers from "../../helpers/index.js"
import * as error from "../../middlewares/error.handler.js"
import { User } from "../../models/user.js"
import db from "../../database/index.js"
import * as validation from "./validation.js"

// @register admin
export const register = async (req, res, next) => {
    // @create transaction
    const transaction = await db.sequelize.transaction();
    try {
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
            roleId : 1
        });

        // @delete unused data from response
        delete user?.dataValues?.password;
        delete user?.dataValues?.invitationToken;
        delete user?.dataValues?.tokenExpiration;
       
        // @generate access token
        const accessToken = helpers.createToken({ id: user?.dataValues?.id, roleId : user?.dataValues?.roleId });

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
        const { email, password } = req.body;
        await validation.LoginValidationSchema.validate(req.body);

        // @check if user exists
        const userExists = await User?.findOne({ where: { email } });
        if (!userExists) throw ({ status : 400, message : error.USER_DOES_NOT_EXISTS })

        // @check if password is correct
        const isPasswordCorrect = helpers.comparePassword(password, userExists?.dataValues?.password);
        if (!isPasswordCorrect) throw ({ status : 400, message : error.INVALID_CREDENTIALS });

        // @generate access token
        const accessToken = helpers.createToken({ id: userExists?.dataValues?.id, roleId : userExists?.dataValues?.roleId });

        // @delete password from response
        delete userExists?.dataValues?.password;
        delete userExists?.dataValues?.invitationToken;
        delete userExists?.dataValues?.tokenExpiration;

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
        const { id } = req.user;

        // @get user data
        const user = await User?.findOne({ where : { id } });

        // @delete password from response
        delete user?.dataValues?.password;
        delete user?.dataValues?.invitationToken;
        delete user?.dataValues?.tokenExpiration;

        // @return response
        res.status(200).json({ user })
    } catch (error) {
        next(error)
    }
}
