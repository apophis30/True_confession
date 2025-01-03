import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect()
    
    try {
        const { username, email, password } = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        });
        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "Username already taken"
            },{status: 400})
        }
        const existingUserVerifiedByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(100000+Math.random()*900000).toString();

        if(existingUserVerifiedByEmail){
            if(existingUserVerifiedByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User Already Exists with this Email"
                },{status: 400})
            }else{
                const hashedPassword = await bcrypt.hash(password,10);
                existingUserVerifiedByEmail.password = hashedPassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now()+3600000);
                await existingUserVerifiedByEmail.save();
            }
        }else{
            const hashedPassword = await bcrypt.hash(password,10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours()+1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });
            await newUser.save();
        }

        // send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            },{status: 500})
        }
        return Response.json({
            success: true,
            message: "User Registered Successfully.Please Verify your email."
        },{status: 201})

    } catch (error) {
        console.error('Error registring user', error)
        return Response.json({
            success: false,
            message: "Error Registring User"
        },{
            status: 500
        })
    }
}