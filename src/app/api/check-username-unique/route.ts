import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(request: Request){
    
    await dbConnect();

    try{
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username')
        }
        // validate with zod
        const result = usernameQuerySchema.safeParse(queryParams);
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid Query Paramater",
            },{
                status: 400
            }
        )
        }

        const { username } = result.data;
        const existingVerifiedUsername = await UserModel.findOne({ username, isVerified: true });
        if(existingVerifiedUsername){
            console.log("Username already Taken");
            return Response.json({
                success: false,
                message: "Username already Taken",
            },
            { status: 500 });
        }
        return Response.json({
            success: true,
            message: "Username is available",
        },{ status: 200 })

    }catch(err){
        console.error("Error Checking Username", err);
        return Response.json({
            success: false,
            message: "Error checking username"
        },
        {
            status: 500
        }
    )
    }
}