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
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  remaining_budget: {
    type: Number,
    default: function() {
      return this.main_budget;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for spent budget
organizationSchema.virtual('spent_budget').get(function() {
  return this.main_budget - this.remaining_budget;
});

// Pre-save middleware
organizationSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set initial remaining budget
    this.remaining_budget = this.main_budget;
    
    // Set first user as owner
    if (this.users.length === 0 && this.organization_owner) {
      this.users.push({
        user: this.organization_owner,
        role: 'owner'
      });
    }
  }
  next();
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

export default Organization;