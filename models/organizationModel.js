import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  organization: {
    type: String,
    required: [true, 'An organization must have a name'],
    unique: true,
    trim: true,
  },
  main_budget: {
    type: Number,
    required: [true, 'An organization must have a main budget'],
    default: 0,
  },
  organization_owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An organization must have an owner'],
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  users: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for spent budget (sum of transactions)
organizationSchema.virtual('spent_budget').get(async function () {
  const Transaction = mongoose.model('Transaction');
  const transactions = await Transaction.find({ organization_id: this._id, status: 'completed' });
  return transactions.reduce((sum, tx) => sum + (tx.effective_amount || 0), 0);
});

// Virtual for remaining budget
organizationSchema.virtual('remaining_budget').get(async function () {
  const spent = await this.spent_budget;
  return this.main_budget - spent;
});

// Pre-save middleware (only for owner setup)
organizationSchema.pre('save', function (next) {
  if (this.isNew && this.organization_owner && this.users.length === 0) {
    this.users.push({
      user: this.organization_owner,
      role: 'owner',
    });
  }
  next();
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

export default Organization;