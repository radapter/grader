'use strict';

var mongoose = require('../conn');
var Schema = mongoose.Schema;

var enrollSchema = new Schema({
  _student:{ type:Schema.Types.ObjectId, ref:'User' },
  _course:{ type:Schema.Types.ObjectId, ref:'Course' },
  grade:{
    Homeworks: { whatif: { type:Number, default:0 }, actual: { type:Number, default:0 }},
    Labs: { whatif: { type:Number, default:0 }, actual: { type:Number, default:0 }},
    Project: { whatif: { type:Number, default:0 }, actual: { type:Number, default:0 }},
    Presentation: { whatif: { type:Number, default:0 }, actual: { type:Number, default:0 }},
    Midterm: { whatif: { type:Number, default:0 }, actual: { type:Number, default:0 }},
    Final: { whatif: { type:Number, default:0 }, actual: { type:Number, default:0 }}
  }
});
enrollSchema.index({ _student: 1, _course: 1}, { unique: true });

var Enroll = mongoose.model('Enroll', enrollSchema);

module.exports = Enroll;
