import mongoose from 'mongoose';
import validate from 'mongoose-validator';

const urlValidator = [
  validate({
    validator: 'isURL',
    message: 'Please enter a valid URL',
  }),
];

const emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Please enter a valid email address',
  }),
];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
  },
  given_name: {
    type: String,
    required: [true, 'A user must have a first name'],
    trim: true,
  },
  family_name: {
    type: String,
    required: [true, 'A user must have a last name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    validate: emailValidator,
  },
  picture: {
    type: String,
    validate: urlValidator,
  },
  primary_organization: {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'owner'
    }
  },
  organizations: [{
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    language: {
      type: String,
      enum: ['en', 'es'],
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'America/Buenos_Aires'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.given_name} ${this.family_name}`;
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.isNew) {
    // If this is a new user and they're creating their first organization
    if (this.primary_organization && this.primary_organization.organization) {
      this.organizations.push({
        organization: this.primary_organization.organization,
        role: 'owner'
      });
    }
  }
  this.lastLogin = new Date();
  next();
});

// Instance method to check if user is member of an organization
userSchema.methods.isMemberOf = function(organizationId) {
  return this.organizations.some(org => 
    org.organization.toString() === organizationId.toString()
  );
};

// Instance method to check user's role in an organization
userSchema.methods.getRoleInOrganization = function(organizationId) {
  const org = this.organizations.find(org => 
    org.organization.toString() === organizationId.toString()
  );
  return org ? org.role : null;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
