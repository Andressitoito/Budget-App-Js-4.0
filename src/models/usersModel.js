// src/models/usersModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid) console.log("Email validation failed:", value);
        return isValid;
      },
      message: "Please enter a valid email address",
    },
  },
  given_name: {
    type: String,
    required: [true, "A user must have a first name"],
    trim: true,
  },
  family_name: {
    type: String,
    required: [true, "A user must have a last name"],
    trim: true,
  },
  picture: {
    type: String,
    required: [true, "A user must have a picture"],
  },
  organizations: [
    {
      organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
      },
      role: { type: String, enum: ["owner", "member"], required: true },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  defaultOrgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    default: null,
  },
  categoryOrder: [
    {
      organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
      order: [String],
    },
  ],
  lastLogin: {
    type: Date, default: Date.now
  },
  mp_id: {
    type: String
  }, // Mercado Pago user ID
  mp_token: {
    type: String
  }, // Mercado Pago access token
  mp_organization_id: {
    type: String
  }, // Mercado Pago organization ID
});

userSchema.virtual("fullName").get(function () {
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

userSchema.pre("save", function (next) {
  console.log("Saving user:", this);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
