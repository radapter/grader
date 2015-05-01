'use strict';

var mongoose = require('../conn');
var Schema = mongoose.Schema;

var enrollSchema = new Schema({
  _student:{ type:Schema.Types.ObjectId, ref:'User' },
  _course:{ type:Schema.Types.ObjectId, ref:'Course' },
  grade:{
    Homeworks: { whatif: Number, actual: Number},
    Labs: { whatif: Number, actual: Number},
    Project: { whatif: Number, actual: Number},
    Presentation: { whatif: Number, actual: Number},
    Midterm: { whatif: Number, actual: Number},
    Final: { whatif: Number, actual: Number}
  }
});
enrollSchema.index({ _student: 1, _course: 1}, { unique: true });

var Enroll = mongoose.model('Enroll', enrollSchema);

module.exports = Enroll;
