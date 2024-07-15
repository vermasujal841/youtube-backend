import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //check if there is name or discrption is available
    //create playlist in model
    //validate the playlist
    //send the playlist object to the user
    if(!name || !description){
        throw new ApiError(404,"give name or description to create playlist")
    }
const playlist=await Playlist.create(
    {
        name,
        description,
        owner: req.user?._id,
    }
)
if(!playlist){
    throw new ApiError(401,"playlist is not created")
}
return res
.status(200)
.json(
    new ApiResponse(200,playlist,"Playlist has been created")
)

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //validate the user
    //apply aggregation pipeline to get all the playlist according to created at
    //show plalist name,description,
    const {userId} = req.params;
    if(userId!=req.user?._id){
        throw new ApiError(401,"user is not valid");
    }
    const allPlaylist =  await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields:{
                totalvideos:{
                    $size:"$videos"
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
                name:1,
                description:1,
                totalvideos:1,
                createdAt:1
            }
        }
    ])
    if(!allPlaylist){
        throw new ApiError(401,"user playlists is not fetched")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,allPlaylist,"user playlist fetched sucessfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //check playlist id and videoid
    //add and upadte a document to add video in playlist 
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"video id is invalid")
    }
    const playlist=await Playlist.findById(playlistId);
    const video=await Video.findById(videoId);
    if(!playlist || !video){
        throw new ApiError(401,"video creds are not there")
    }
    if(playlist.owner.toString() !=req.user?._id.toString() ){
        throw new ApiError(401,"video in playlist should be added by owner")
    }
    const addedPlaylist=await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $addToSet:{
                videos:videoId,
            },
        },
        {
            new:true
        }
    )
    if(!addedPlaylist){
        throw new ApiError(401,"user playlist is not fetched")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,addedPlaylist,"video added to the playlist sucessfully"))
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    //validate playlistId and videoId
    //update playlist document
    const {playlistId, videoId} = req.params;
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"playlist id and video id is invalid")
    }
    const playlist= await Playlist.findById(playlistId);
    const video= await Video.findById(videoId);
    if(!playlist || !video){
        throw new ApiError(400,"video or playlist does not exist")
    }
    if(req.user?._id!=playlist?.owner){
        throw new ApiError(401,"video in playlist should be remove by owner")
    }
    const removeVideo=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId
            }
        },
        {
            new:true
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,removeVideo,"video added to the playlist sucessfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
       throw new ApiError(401,"the playlist id is not valid")
    }
    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"oops! playlist not found")
    }
    if(playlist?.owner.toString()!=req.user?._id.toString()){
        throw new ApiError(401,"playlist should be deleted by the the user who is the owner of the playlist")
    }
    const deletePlaylis=await Playlist.findByIdAndDelete(
        playlist?._id
    )
    if(!deletePlaylis){
        new ApiError(400,"playlist did not deleted")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,deletePlaylis,"playlist deleted sucessfully"))
})


const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)){
        throw new ApiError(401,"the playlist id is not valid")
     }
     const playlist=await Playlist.findById(playlistId);
     if(!playlist){
         throw new ApiError(404,"oops! playlist not found")
     }
     if(playlist?.owner.toString()!=req.user?._id.toString()){
         throw new ApiError(401,"playlist should be updated by the the user who is the owner of the playlist")
     }
     if(!name || !description){
        throw new ApiError(404,"give name or description to update playlist")
    }
    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $set:{
                name,
                description
            }
            
        },
        {new:true}
    )
    if(!updatedPlaylist){
        new ApiError(400,"playlist did not deleted")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"playlist updated sucessfully"))
    
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}