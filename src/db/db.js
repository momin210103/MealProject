import mongoose from "mongoose";
import { DB_NAME } from "../contstans.js";


const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\n MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("MongoDB Connenction Error",error);
        process.exit(1);
    }
}
export default connectDB