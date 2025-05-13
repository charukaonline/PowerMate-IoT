const mongoose = require('mongoose');

const ThresholdSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thresholds: {
        powerSupply: {
            minVoltage: { type: Number, default: 10 },
            maxVoltage: { type: Number, default: 13 },
            minCurrent: { type: Number, default: 0.5 },
            maxCurrent: { type: Number, default: 5 },
        },
        backupBattery: {
            minVoltage: { type: Number, default: 9 },
            maxVoltage: { type: Number, default: 12.5 },
            minCurrent: { type: Number, default: 0.5 },
            maxCurrent: { type: Number, default: 5 },
        },
        generator: {
            tankCapacity: { type: Number, default: 200 },
            criticalLevel: { type: Number, default: 15 },
        },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Create a unique index on userId to ensure one settings document per user
ThresholdSchema.index({ userId: 1 }, { unique: true });

const Threshold = mongoose.model('Threshold', ThresholdSchema);

module.exports = Threshold;