import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { uploadController } from "./upload.controller.js";

export const uploadRoutes = Router();

uploadRoutes.post("/presign", requireAuth, uploadController.presign);
