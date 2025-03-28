import mongoose from "mongoose";
import validate from "mongoose-validator";

const urlValidator = [
  validate({
    validator: "isURL",
    message: "Please enter a valid URL",
  }),
];

const emailValidator = [
  validate({
    validator: "isEmail",
    message: "Please enter a valid email address",
  }),
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
      trim: true,
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
    email: {
      type: String,
      required: [true, "A user must have an email"],
      unique: true,
      validate: emailValidator,
    },
    picture: { type: String, validate: urlValidator },
    organizations: [
      {
        organization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
          required: true,
        },
        role: { type: String, enum: ["owner", "admin", "member"], required: true },
        joinedAt: { type: Date, default: Date.now },
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

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
