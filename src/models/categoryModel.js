import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "A category must have a name"],
		trim: true,
	},
	organization_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Organization",
		required: [true, "A category must belong to an organization"],
	},
	base_amount: {
		type: Number,
		required: [true, "A category must have a base amount"],
		default: 0,
	},
	spent_amount: {
		type: Number,
		default: 0,
	}, // Tracks total spent
	remaining_budget: {
		type: Number,
		default: 0,
	},
	transactions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Transaction"
		}]
});

export default mongoose.models.Category ||
	mongoose.model("Category", categorySchema);
