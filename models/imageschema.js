import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    image: Buffer
  },
  {
    collection: "Image_model"
  }
);

export default mongoose.model("Image_model", ImageSchema);