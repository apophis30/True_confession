import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

export async function POST(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "Not Authenticated"
        },{status: 401});
    }

    const userId = user._id;
    const { isAcceptingMessage } = await request.json();

    try {
        const UpdatedUser = await UserModel.findByIdAndUpdate(userId,
            {isAcceptingMessage: isAcceptingMessage},{new: true});
        
        if(!UpdatedUser){
            return Response.json({
                success: false,
                message: "failed to update user status to accept message",
            },{status: 401});
        }

        return Response.json({
            success: true,
            message: "Message acceptance status updated successfully",
            UpdatedUser
        },{status: 500});

    } catch (err) {
        console.log("failed to update user status to accept message")
        return Response.json({
            success: false,
            message: "failed to update user status to accept message"
        },{status: 500});
    }

}

export async function GET(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "Not Authenticated"
        },{status: 401});
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
        if(!foundUser){
            return Response.json({
                success: false,
                message: "user not found",
            },{status: 404});
        }

        return Response.json({
            success: true,
            isAcceptingMessage: foundUser.isAcceptingMessage,
        },{status: 200});

    } catch (err) {
        console.log("failed to update user status to accept message")
        return Response.json({
            success: false,
            message: "Error in getting Message Acceptance Status"
        },{status: 500});
    }
}