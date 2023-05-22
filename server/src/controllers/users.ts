import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user";
import { UserDocument } from "../types/user.interface";
import { Error } from "mongoose";
import jwt from "jsonwebtoken";
import { secret } from "../config"
import {ExpressRequestInterface} from "../types/expressRequest.interface";

const normalizeUser = (user: UserDocument) => {
    const token = jwt.sign({id: user.id, email: user.email}, secret)

    return {
        email: user.email,
        userName: user.userName,
        id: user.id,
        token: `Bearer ${token}`
    }
}
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        // const newUser = new UserModel({
        //     email: req.body.email,
        //     userName: req.body.userName,
        //     password: req.body.password
        // });
        // const savedUser = await newUser.save();
        res.send('server work');
    } catch (error) {
        if (error instanceof Error.ValidationError) {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(422).json(messages);
        }
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await UserModel.findOne({
            email: req.body.email
        }).select('+password');
        const errors = { emailOrPassword: "email or password is incorrect"};

        if (!user) {
            return res.status(422).json(errors);
        }

        const isSamePassword = await user.validatePassword(req.body.password);

        if (!isSamePassword) {
            return res.status(422).json(errors);
        }

        res.send(normalizeUser(user));

    } catch (error) {
        next(error);
    }
};

export const currentUser = (req: ExpressRequestInterface, res: Response) => {
    if (!req.user) {
        return res.sendStatus(401);
    }
    res.send(normalizeUser(req.user));
};