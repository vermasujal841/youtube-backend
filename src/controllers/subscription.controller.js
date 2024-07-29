import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    //take the channel id and validate
    //make sure that the channel is already subcribed or not 
    //if not change the database to subscribe
    //if yes then change the data base to not subscribe

    const {channelId} = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(401,"channel id dose not exist")
    }
    const userId=req.user?._id;
    const alreadySubscribed=await Subscription.findOne(
        {
            subscriber:userId,
            channel:channelId
        }
    )
    if(alreadySubscribed){
        await Subscription.findByIdAndDelete(alreadySubscribed._id)
        return res
        .status(200)
        .json(new ApiResponse(200,{isSubscribed:false},"user unsubcribes sucessfully"))
    }
    const subscribes=await Subscription.create(
        {
            subscriber:userId,
            channel:channelId
        }
    )
    if(!subscribes){
        throw new ApiError(200,subscribes)
    }
    return res
    .status(200)
    .json(new ApiResponse(200,subscribes,"user subcribes sucessfully"))
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"channel id dose not exist")
    }
    const subscribers=await Subscription.aggregate(
        [
            {
                $match:{
                    channel:channelId
                }
            },
            {
                $lookup:{
                        from: "users",
                        localField: "subscriber",
                        foreignField: "_id",
                        as: "subscriber",
                        pipeline:[
                            {
                                $lookup:{
                                    from:"subscribers",
                                    localField:"_id",
                                    foreignField:"channel",
                                    as:"subscribedTo"
                                },
                                $addFields:{
                                    subscribedTosubscriber:{
                                        $cond:{
                                            if:{
                                                $in:[
                                                    channelId,
                                                    "$subscribedTo.subscriber"
                                                ]
                                            },
                                            then:"true",
                                            else:"false" 
                                        }
                                    },
                                    subscriberCount:{
                                        $size:"$subscribedTosubscriber"
                                    }
                                }   
                            }
                        ]
                }
            },
            {
                $unwind:"subscriber"
            },
            {
                $project:{
                    _id:0,
                    subscribers:{
                        _id:1,
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                        subscribedToSubscriber: 1,
                        subscribersCount: 1,
                    }
                }
            }
            
        ]
    )
    if(!subscribers){
        throw new ApiError(200,"data dose not fetched")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,subscribers,"subscribers data fetched sucessfully"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"subcriber id does not exist")
    }
    const channels=await Subscription.aggregate(
        [
            {
                $match:{
                    subscriber:subscriberId
                },
            },
            {
                $lookup:{
                    from:"users",
                    localField:"channel",
                    foreignField:"_id",
                    as:"userDetails",
                    pipeline:[
                    {
                        $lookup:{
                            from:"videos",
                            localField:"_id",
                            foreignField:"owner",
                            as:"channelVideos"
                        },
                        $addFields:{
                            latestVideo:{
                                $last:"$channelVideos"
                            }
                        },

                    }
                    ]
                }
            },
            {
                $unwind:"$userDetails"
            },
            {
                $project:{
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    }
                }
            }
        ]
    )
    if(!channels){
        throw new ApiError(200,"data dose not fetched")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,channels,"channels data fetched sucessfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}