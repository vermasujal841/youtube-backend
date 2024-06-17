import mongoose,{Schema} from "mongoose";

const playlistSchema=new Schema(
    {
        videos:[
            {
                type:Schema.Types.ObjectId,
                ref:"User"
            }       
        ],
        owners:[
            {
                type:Schema.Types.ObjectId,
                ref:"User"
            }
        ],
        discription:{
            type:String,
            requried:true
        },
        name:{
            type:String,
            requried:true
        }
    },
{
    timestamps:true
})
export const Playlist=mongoose.model("Playlist",playlistSchema)