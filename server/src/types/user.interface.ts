import { Document } from "mongoose";
export interface User {
    email: string;
    userName: string;
    password: string;
    createdAt: Date;
}
export interface UserDocument extends User, Document {
    validatePassword(param1: string): Promise<boolean>;
}