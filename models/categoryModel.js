import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
	{
		category_name: {
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
		transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Virtuals (async due to population)
categorySchema.virtual("spent_amount").get(async function () {
	if (!this.populated("transactions")) {
		await this.populate("transactions");
	}
	return this.transactions.reduce(
		(sum, tx) => sum + (tx.effective_amount || 0),
		0
	);
});

categorySchema.virtual("remaining_amount").get(async function () {
	const spent = await this.spent_amount;
	return this.base_amount - spent;
});

export default mongoose.models.Category ||
	mongoose.model("Category", categorySchema);
