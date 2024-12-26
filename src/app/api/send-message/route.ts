import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/User";

export async function POST(request: Request){
    await dbConnect();

    const { username,content } = await request.json();
    try {
        const user = await UserModel.findOne({ username });
        if(!user){
            return Response.json({
                success: false,
                message: "User Not Found"
            },{status: 404});
        }

        if(!user.isAcceptingMessage){
            return Response.json({
                success: false,
                message: "User is Not Accepting Message Now"
            },{status: 403});
        }

        const newMessage = { content, createdAt: new Date() };
        user.messages.push(newMessage as Message)
        await user.save();

        return Response.json({
            success: true,
            message: "Message Sent Successfully"
        },{status: 200});
    } catch (err) {
        console.log("Error Adding Messages", err);
        return Response.json({
            success: false,
            message: "Internal Server Error"
        },{status: 500});
    }
}