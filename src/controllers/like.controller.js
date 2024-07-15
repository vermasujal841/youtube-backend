
import { ApiError } from "../utils/ApiError";
import { Like } from "../models/like.model";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose, {isValidObjectId} from "mongoose";

const toggleVideoLike=asyncHandler(async(res,req)=>{
    const {videoId}=req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"video id is invalid")
    }
    const userId=req.user?._id;
    const youLiked=await Like.findOne(
        {
            video:videoId,
            likedBy:userId
        }
    )
    if(youLiked){
        await Like.findByIdAndDelete(youLiked._id)
        return res
        .status(200)
        .json(new ApiResponse(200,{isLiked:false}))
    }
    const likes=await Like.create(
        {
            video:videoId,
            likedBy:userId
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,likes))
});
const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"comment id is invalid");
    }
    const youLiked=await Like.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })
    console.log(youLiked);
    if(youLiked){
        await Like.findByIdAndDelete(youLiked._id);
        return res
        .status(200)
        .json(200,{isLiked:false})
    }
    await Like.create(
        {
            comment:commentId,
            likedBy:req.user?._id
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,{isLiked:true},"Liked successfully"))
})
const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"tweet id is invalid");
    }
    const youLiked=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user?._id
    })
    if(youLiked){
        await Like.findByIdAndDelete(youLiked._id);
        return res
        .status(200)
        .json(200,{isLiked:false},"Unliked Successfully")
    }
    await Like.create(
        {
            tweet:tweetId,
            likedBy:req.user?._id
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,{isLiked:true},"Liked successfully"))
})
const getLikedVideos=asyncHandler(async(req,res)=>{
    const likedVideos=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"list",
                pipeline:[
                    {
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner_details"
                    },
                    {
                        $unwind:"$owner_details"
                    }
                ]
            }
        },
        {
            $unwind:"$list"
        },
        {
            $addFields:{
                likelist:{
                    $first:"$list"
                },
                vidcount:{
                    $size:"$list"
                }
            }
        },
        {
            $project:{
                vidcount:1,
                list:{
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1
                    }
                }
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,likedVideos,"liked videos fetched"))
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}


