import mongoose from "mongoose";

const bazarlistSchema = new mongoose.Schema({
  date: { type: Date },
  name: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Bazarlist = mongoose.model("Bazarlist", bazarlistSchema);

export default Bazarlist;
