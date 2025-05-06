const mongoose = require('mongoose');

const ThresholdSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thresholds: {
        voltage: {
            min: { type: Number, default: 200 },
            max: { type: Number, default: 250 },
            warningMin: { type: Number, default: 210 },
            warningMax: { type: Number, default: 240 },
        },
        current: {
            min: { type: Number, default: 5 },
            max: { type: Number, default: 40 },
            warningMin: { type: Number, default: 10 },
            warningMax: { type: Number, default: 30 },
        },
        fuel: {
            warningLevel: { type: Number, default: 30 },
            criticalLevel: { type: Number, default: 15 },
        },
        battery: {
            warningVoltage: { type: Number, default: 11.8 },
            criticalVoltage: { type: Number, default: 11.2 },
            maxTemperature: { type: Number, default: 45 },
        },
        temperature: {
            normal: { type: Number, default: 70 },
            warning: { type: Number, default: 85 },
            critical: { type: Number, default: 95 },
        }
    },
    tankCapacity: { type: Number, default: 200 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Create a unique index on userId to ensure one settings document per user
ThresholdSchema.index({ userId: 1 }, { unique: true });

const Threshold = mongoose.model('Threshold', ThresholdSchema);

module.exports = Threshold;