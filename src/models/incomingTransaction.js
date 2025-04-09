import mongoose from "mongoose";

const incomingTransactionSchema = new mongoose.Schema({
  name: {
    type: String, required: true
  },
  amount: {
    type: Number, required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  external_id: {
    type: String, unique: true
  }, // For Mercado Pago payment ID later
  createdAt: {
    type: Date, default: Date.now
  },
});

const IncomingTransaction =
  mongoose.models.IncomingTransaction ||
  mongoose.model("IncomingTransaction", incomingTransactionSchema);

export default IncomingTransaction;
