import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request){
    await dbConnect()

    try {
        const { username, code } = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({username: decodedUsername});
        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User Not Found"
                },
                {
                    status: 500
                }
            );
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "Account Verified Successfully"
                },
                {
                    status: 200
                }
            );
        }else if( !isCodeNotExpired ){
            return Response.json(
                {
                    success: false,
                    message: "Verification Code Expired, Please SignUp again to get a new code"
                },
                {
                    status: 400
                }
            );
        }else{
            return Response.json(
                {
                    success: false,
                    message: "Incorrect Verification Code"
                },
                {
                    status: 500
                }
            );
        }

    } catch (err) {
        console.error("Error Verifying User", err);
        return Response.json(
            {
                success: false,
                message: "Error Verifying User"
            },
            {
                status: 500
            }
        );
    }
}