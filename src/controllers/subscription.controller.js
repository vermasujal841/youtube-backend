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
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}