'use strict';

var mongoose = require("mongoose");

var Element = mongoose.Schema({

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },

  root:{
    type: Boolean,
    require: true,
    default: false
  },

  path: String,

  title: {
    type:String
  },

  editors: [],

  state: {
    type: String,
    enum: ["public","invite", "private"],
    default: "private"
  }

});

module.exports = mongoose.model('Element', Element);