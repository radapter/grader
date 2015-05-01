'use strict';

var mongoose = require('../conn');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
  _owner:{ type:Schema.Types.ObjectId, ref:'User' },
  name: String,
  description: String,
  meta:{
    Homeworks: { max: Number, factor: Number},
    Labs: { max: Number, factor: Number},
    Project: { max: Number, factor: Number},
    Presentation: { max: Number, factor: Number},
    Midterm: { max: Number, factor: Number},
    Final: { max: Number, factor: Number}
  },
  policy:{
    A:Number,
    B:Number,
    C:Number,
    D:Number
  }
});

var Course = mongoose.model('Course', courseSchema);

//Validation
// Course.schema.path('policy').validate(function (p) {
//   return p.A >= p.B && p.B >= p.C && p.C >= p.D && p.A <= 1 && p.D >= 0;
// }, 'Invalid policy: 100% >= A >= B >= C >= D >= 0%');

module.exports = Course;
