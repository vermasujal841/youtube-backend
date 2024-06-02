import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.send.CLOUDINARY_CLOUD_NAME, 
    api_key: process.send.CLOUDINARY_API_KEY, 
    api_secret: process.send.CLOUDINARY_API_SECRET// Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localStorage) return null;
        const response=await cloudinary.uploader.upload(
            localFilePath,{
                resource_type:"auto"
            }
        )
        console.log("file is uploaded on cloudinary ",response.url);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saves temp memory file
        return null;
    }
}
