'use strict';

var mongoose = require('mongoose')
  , utils = require('../utils');

var User = mongoose.Schema({

  name: {
    type: String
  },

  email : {
    type:String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    required: true,
    enum : ["User", "Administrator"],
    default: "User"
  }

});

User.methods.checkPassword = function(passwd) {
  return this.password == utils.sha256(passwd);
};

User.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('User', User);