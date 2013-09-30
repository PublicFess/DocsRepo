'use strict';

var mongoose = require("mongoose");

var Directory = mongoose.Schema({

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },

  title: {
    type:String
  },

  url: String,

  editors: [],

  state: {
    type: String,
    enum: ["public","invite", "private"],
    default: "private"
  }

});

module.exports = mongoose.model('Directory', Directory);