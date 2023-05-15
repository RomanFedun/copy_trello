import { model, Schema } from "mongoose";
import { UserDocument } from "../types/user.interface";
import validator from "validator";
import bcryptjs from "bcryptjs";

const userSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: [validator.isEmail, 'invalid email'],
        createIndexes: { unique: true }
    },
    userName: {
        type: String,
        required: [true, 'UserName is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false
    }
},
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        return next();
    } catch (error) {
        return next(error as Error);
    }
});

userSchema.methods.validatePassword = function (password: string): Promise<boolean> {
    return bcryptjs.compare(password, this.password);
}

export default model<UserDocument>('User', userSchema);