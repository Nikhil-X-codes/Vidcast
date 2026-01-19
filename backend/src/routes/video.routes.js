import { Router } from "express";
import {generateCloudinarySignature,videouploading,videodeleting,videoupdating,getAllVideos,getSingleVideo,viewonvideo,getVideosOnSearch,saveVideoData} from "../Controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

videoRouter.post("/sign-upload", verifyJWT, generateCloudinarySignature);

const videoRouter = Router();

videoRouter.post(
  "/upload",
  verifyJWT,
  upload.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]),
  videouploading
);

videoRouter.delete("/delete/:videoId", verifyJWT,videodeleting);

videoRouter.patch("/update/:videoId", verifyJWT,videoupdating);    

videoRouter.get("/all",verifyJWT,getAllVideos);                                               
videoRouter.get("/single/:videoId",verifyJWT,getSingleVideo);

videoRouter.get("/view/:videoId",verifyJWT,viewonvideo);
videoRouter.get("/result", verifyJWT, getVideosOnSearch);

videoRouter.post("/save-video-data", verifyJWT, saveVideoData);


export default videoRouter;