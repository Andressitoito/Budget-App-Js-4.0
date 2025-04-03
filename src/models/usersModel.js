// src/models/usersModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'A user must have a username'],
      unique: true,
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
    picture: {
      type: String,
      validate: {
        validator: (value) => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value),
        message: 'Please enter a valid URL',
      },
    },
    organizations: [
      {
        organization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Organization',
          required: true,
        },
        role: { type: String, enum: ['owner', 'member'], required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    defaultOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    categoryOrder: [
      {
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        order: [String],
      },
    ],
    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('fullName').get(function () {
  return `${this.given_name} ${this.family_name}`;
});

userSchema.methods.isMemberOf = function (organizationId) {
  return this.organizations.some(
    (org) => org.organization.toString() === organizationId.toString()
  );
};

userSchema.methods.getRoleInOrganization = function (organizationId) {
  const org = this.organizations.find(
    (org) => org.organization.toString() === organizationId.toString()
  );
  return org ? org.role : null;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;