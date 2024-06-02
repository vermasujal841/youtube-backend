import mongoose,{Schema} from 'mongoose';
const userSchema=new Schema(
    {
        username:
        {
        type:String,
        requried:true,
        unique:true,
        index:true,
        lowercase:true,
        trim:true
        }
    }
)
export const User=mongoose.model("User",userSchema);
