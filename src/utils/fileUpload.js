import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath) => {
    try {
        console.log("filePath: ",filePath);
        if(!filePath) return null;
            //upload file
            const response = await cloudinary.uploader.upload(filePath, {
                resource_type: 'auto'
            })
            // console.log("Cloudinary Upload Success:", response.url);  

        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(filePath)
        return response;
        
    }
    catch (error) {
        fs.unlinkSync(filePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export { uploadOnCloudinary };