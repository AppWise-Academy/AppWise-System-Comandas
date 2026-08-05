import { Schema, model } from "mongoose";
import { ROLES } from "../shared/constants.js";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Min 3 characters"],
      maxlength: [50, "Max 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Min 6 characters"],
      select: false,
    },
    rol: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: "El rol debe ser: admin, mozo, cocina o cajero",
      },
      default: ROLES.MOZO,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    avatarPublicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  this.password = await bcryptjs.hash(this.password, 10);
  next;
});

userSchema.methods.comparePassword = async function (plain) {
  return bcryptjs.compare(plain, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.password;
  delete obj.avatarPublicId;
  return obj;
};

const UserModel = model("User", userSchema);

export default UserModel;
