import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address_line: {
        type: String,

    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: " "
    },
    pincode: {
        type: String
    },
    country: {
        type: string
    },
    mobile: {
        type: Number,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const address = mongoose.model('address', addressSchema)

export default addressModel