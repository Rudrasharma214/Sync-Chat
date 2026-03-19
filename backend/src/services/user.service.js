import { STATUS } from "../constant/statusCodes.js";
import * as userRepo from "../repositories/user.repositories";
import { hashPassword } from "../utils/password";

export const createUser = async ({fullname, email, password}) => {
    try {
        const existingUser = await userRepo.getUserByEmail(email)

        if(existingUser) {
            return {
                success: false,
                statusCode: STATUS.CONFLICT,
                message: "User with this email already exists"
            }
        }

        const hashedPassword = await hashPassword(password)
        const newUser = await userRepo.createUser({ fullname, email, password: hashedPassword });

        return {
            success: true,
            message: "User created successfully",
            data: newUser
        };

    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in creating user",
            error: error.message
        }
    }
};