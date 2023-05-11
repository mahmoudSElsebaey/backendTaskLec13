const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate(value) {
      let password = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"
      );
      if (!password.test(value)) {
        throw new Error(
          "Password is weak , must include uppercase , lowercase , numbers , speacial characters"
        );
      }
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error("Email is invalid");
      }
    },
  },
  age: {
    type: Number,
    default: 18,
    validate(val) {
      if (val <= 0) {
        throw new Error("age must be positive number");
      }
    },
  },
  city: {
    type: String,
  },
  tokens: [
    {
      type: String,
      required: true,
    },
  ],
});
// /////////////////////////////////////////////////////////
/// =====> Hash Password
userSchema.pre("save", async function () {
  const user = this;
  // console.log(user);

  if (user.isModified("password"))
    user.password = await bcryptjs.hash(user.password, 8);
});

// /////////////////////////////////////////////////////////
/// =====> Login
userSchema.statics.findByCredentials = async (userEmail, userPass) => {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw new Error("Unable To Login");
  }

  const isMatch = await bcryptjs.compare(userPass, user.password);
  if (!isMatch) {
    throw new Error("Unable To Login");
  }
  return user;
};
/////////////////////////////////////////////////////////////
///// =======> create token
userSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "mysecretkey");
  user.tokens = user.tokens.concat(token);
  await user.save();
  return token;
};
////////////////////////////////////////////////////////////////////////////
/////// =====> Hide private data

userSchema.methods.toJSON=function(){
  const user =this
  const userObj = user.toObject()
  delete userObj.password
  delete userObj.tokens
  return userObj
}



const User = mongoose.model("Uesr", userSchema);

module.exports = User;
