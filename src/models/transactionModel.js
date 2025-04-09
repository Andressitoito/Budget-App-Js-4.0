import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "A transaction must have a category"],
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: [true, "A transaction must have an organization"],
  },
  username: {
    type: String,
    required: [true, "A transaction must have a username"],
    trim: true,
  },
  item: {
    type: String,
    required: [true, "A transaction must have an item name or description"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "A transaction must have a price"],
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "completed",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});



const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
