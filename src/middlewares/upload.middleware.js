import multer from "multer";

const storage = multer.memoryStorage(); // keep in memory

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit: 5MB
});
