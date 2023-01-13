import mongoose, { Schema, Document } from "mongoose";

const schema = new Schema(
  {
    mintAddress: { type: String, required: true },
    transactionSignature: { type: String, required: true },
    pandaMintAddress: { type: String, required: true },
    user: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PreSale", schema);
