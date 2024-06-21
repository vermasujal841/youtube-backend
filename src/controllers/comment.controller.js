import { Video } from "../models/video.model"; 
import { User } from "../models/user.model";
import { Comment } from "../models/comment.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose from "mongoose"

const getVideoComments=asyncHandler(async(req,res)=>{
    //get video id from thew user which he clicked
    //check if that video is in the database or not
    //apply aggregation pipeline to get comments of the video
    //create a response to the frontend

    // console.log(req.params);
    const {videoId}=req.params;
    const {page = 1, limit = 10} = req.query
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    const videoComment= await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likes"
            }
        },
        {
            $addFields:{
                likes:{
                    $size:"$likes"
                },
                owner:{
                    $first:"$owner"
                },
                isLiked:{
                    $cond:{
                        if: {$in: [req.user?._id, "$likes.likedBy"]},
                            then: true,
                            else: false
                    }
                    
                }

            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                owner:{
                    username:1,
                    fullname:1,
                    avatar:1
                },
                content:1,
                createdAt:1,
                likes:1,
                isLiked:1
            }
        }
    ])
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    // Fetch paginated results
    const videoComments = await Comment.aggregatePaginate(videoComment, options);

    // If no comments are found, throw an error
    if (!videoComments.length) {
        throw new ApiError(404, "Comments do not exist");
    }

    // Create a response to the frontend
    return res.status(200).json(new ApiResponse(200, videoComments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    //do auth test(jwt middlewhere) to check the commented user is loged in or not
    //fetched the content,video of the user 
    //add it to the database
    const {content}=req.body;
    const {videoId}=req.params;
    if(!content){
        throw new  ApiError(501,"Comment is not added")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    const userCommented=req.user?.id;
    const comment=await Comment.create(
        {content,
        video : videoId,
        owner:userCommented}
    )
    if(!comment){
        throw new  ApiError(400,"Comment is not added")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment added successfully")
    )
})
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    //take the content from the user
    //check that the comment is updated by the user who commented
    //find and update by the id
    //set into the mongo db database
    
    const {content}=req.body;
    const {commentId}=req.params;
    if(!content){
        throw new ApiError(400,"comment is not given")
    }
    const comment=await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(400,"comment not exist")
    }

    const userCommented=req.user?.id;
    if(!(userCommented.toString()===comment?.owner.toString())){
        throw new ApiError(400,"Auth error")
    }

    const updatedComment=await Comment.findByIdAndUpdate(
        userCommented,
        {
            $set:{
                content
            }
        },
        {new:true}
    )
    if(!updatedComment){
        throw new ApiError(400,"fail to update")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedComment,"comment updated sucessfully")
    )


})
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params;
    const comment=await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(400,"comment not exist")
    }

    
    if(!(req.user?.id.toString()===comment?.owner.toString())){
        throw new ApiError(400,"Auth error")
    }

    await Comment.findByIdAndDelete(
        commentId
    )
    await Like.findByIdAndDelete(
       { comment:commentId}
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,{commentId},"comment delete sucessfully")
    )

})

export{
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}


   

    

