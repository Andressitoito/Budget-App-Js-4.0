import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: [true, 'A category must have a name'],
    trim: true,
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'A category must belong to an organization'],
  },
  base_amount: {
    type: Number,
    required: [true, 'A category must have a base amount'],
    default: 0,
  },
  remaining_amount: {
    type: Number,
    required: [true, 'A category must have a remaining amount'],
    default: 0,
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add any virtual fields here if needed
categorySchema.virtual('spent_amount').get(function() {
  return this.base_amount - this.remaining_amount;
});

// Add any pre/post hooks here if needed
categorySchema.pre('save', function(next) {
  if (this.isNew) {
    this.remaining_amount = this.base_amount;
  }
  next();
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;

