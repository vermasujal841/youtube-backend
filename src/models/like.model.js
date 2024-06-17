import mongoose,{Schema} from "mongoose";

const likeSchema=new Schema({
     video:{
        type:Schema.Types.ObjectId,
        ref:"User"
     },
     likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
     },
     comment:{
        type:Schema.Types.ObjectId,
        ref:"User"
     },
     tweet:{
        type:Schema.Types.ObjectId,
        ref:"User"
     },
},{
    timestamps:true
})

export const Like=mongoose.model("Like",likeSchema);