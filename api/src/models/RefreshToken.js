import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      require: [true, "Token is required"],
      unique: true,      
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: [true, "Usuario is required"]
    },
    expiraEn: {
      type: Date,
      require: true,
      index: true,
      expires: 0
    }

  },{
    timestamps: true,
    versionKey: false,
  }
  
);

const RefreshTokenModel = model("RefreshToken", refreshTokenSchema);

export default RefreshTokenModel; 