'use strict';

var mongoose = require("mongoose");

var Document = mongoose.Schema({

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },

  text: String,

  url: String,

  state: {
    type: String,
    enum: ["public","invite", "private"],
    default: "private"
  }
});

module.exports = mongoose.model('Document', Document);
