const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
    username :{
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
}
);

const User = mongoose.model("users",userSchema)

module.exports = User;