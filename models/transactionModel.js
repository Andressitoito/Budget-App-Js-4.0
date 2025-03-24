import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'A transaction must have a category'],
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'A transaction must have an organization'],
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A transaction must have a user'],
  },
  item: {
    type: String,
    required: [true, 'A transaction must have an item name or description'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'A transaction must have a price'],
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed',
  },
  notes: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to update category and organization remaining amounts
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Update category remaining amount
      const category = await mongoose.model('Category').findById(this.category_id);
      if (category) {
        const amount = this.type === 'expense' ? -this.price : this.price;
        category.remaining_amount += amount;
        await category.save();
      }

      // Update organization remaining budget
      const organization = await mongoose.model('Organization').findById(this.organization_id);
      if (organization) {
        const amount = this.type === 'expense' ? -this.price : this.price;
        organization.remaining_budget += amount;
        await organization.save();
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;
