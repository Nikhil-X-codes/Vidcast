import asynchandler from "../utils/asynchandler.js";
import { Video } from "../models/Video.model.js";
import {uploadoncloudinary} from "../utils/Cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiresponse.js"; 
import { User } from "../models/User.model.js";

import { v2 as cloudinary } from 'cloudinary';


const generateCloudinarySignature = asynchandler(async (req, res) => {
    const { folderName } = req.body; 

    const timestamp = Math.round((new Date).getTime() / 1000);

    const params = {
        timestamp: timestamp,
        folder: folderName || 'vidcast_videos', 
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    res.status(200).json(new ApiResponse(200, "Signature generated successfully", {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY
    }));
});

const videouploading = asynchandler(async (req, res) => {
  const { title, description } = req.body;

  const videoFile = req.files?.video?.[0];      // assuming array of files
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (!videoFile) throw new ApiError(400, "Please upload a video file");
  if (!thumbnailFile) throw new ApiError(400, "Please upload a thumbnail image");

  const videoUrl = await uploadoncloudinary(videoFile.path);
  const thumbnailUrl = await uploadoncloudinary(thumbnailFile.path);

  if (!videoUrl && !thumbnailUrl) {
    throw new ApiError(500, "Upload failed");
  }

  const video = await Video.create({
    title,
    description,
    video:videoUrl,
    thumbnail: thumbnailUrl,
    owner: req.user?._id
  });

  res.status(200).json(new ApiResponse(200,"Video uploaded successfully", video));
});


const videodeleting = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await Video.deleteMany({ _id: videoId});

  res.status(200).json(new ApiResponse(200,"Video deleted successfully"));
});


const videoupdating = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  await video.save();

  res.status(200).json(new ApiResponse(200, "Video updated successfully", {
    videoId: video._id,
    title: video.title,
    description: video.description,
  }));
});


const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const loggedInUserId = req.user?._id;

    if (!loggedInUserId) {
        throw new ApiError(401, "Unauthorized");
    }

    const filter = { owner: loggedInUserId };

    const videos = await Video.find(filter)
        .populate("owner", "_id username avatar")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, "Videos fetched successfully", {
            videos: videos || [], 
            pagination: {
                totalVideos,
                limit: parseInt(limit),
                totalPages: Math.ceil(totalVideos / limit),
                currentPage: parseInt(page),
            },
        })
    );
});

const getVideosOnSearch = asynchandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  if (!search || search.trim() === "") {
    return res.status(400).json({ message: "Search query is required" });
  }

  const searchRegex = new RegExp(search, "i");

  const filter = {
    $or: [
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
    ]
  };

  const videos = await Video.find(filter)
    .populate("owner", "_id username avatar")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const totalVideos = await Video.countDocuments(filter);

  if (totalVideos === 0) {
    throw new ApiError(404, "No videos found matching your search");
  }

  res.status(200).json(new ApiResponse("Videos fetched successfully", {
    videos,
    pagination: {
      totalVideos,
      limit: parseInt(limit),
      totalPages: Math.ceil(totalVideos / limit),
      currentPage: parseInt(page),
    },
  }));
});

const getSingleVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId)
    .populate("owner", "_id username avatar"); // <-- this line is added

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  res.status(200).json(new ApiResponse("Video fetched successfully", video));
});


const viewonvideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.views += 1;
  await video.save();

  const user = await User.findById(req.user._id);

  if (!user.watchhistory.includes(video._id)) {
    user.watchhistory.push(video._id);
    await user.save();
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Video viewed and added to watch history", video));
});

const saveVideoData = asynchandler(async (req, res) => {
    const { title, description, videoUrl, thumbnailUrl } = req.body;

    if (!videoUrl) {
       throw new ApiError(400, "Video URL is missing");
    }
    const video = await Video.create({
        title,
        description,
        video: videoUrl,
        thumbnail: thumbnailUrl || "",
        owner: req.user._id
    });

    await User.findByIdAndUpdate(
        req.user._id,
        { 
            $push: { videos: video._id } 
        },
        { new: true }
    );

    res.status(200).json(new ApiResponse(200, "Video saved successfully", video));
});


export {generateCloudinarySignature,videouploading,videodeleting,videoupdating,getAllVideos,getSingleVideo,viewonvideo,getVideosOnSearch,saveVideoData};