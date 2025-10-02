import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"

    },
    orderId: {
        type: String,
        required: [true, "provide orderId"],
        unique: true
    },

    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product"
    },
  
    product_details: {
        _id: String,
        name: String,
        Image: Array,
    },
    playment_status : {
        type : String,
        default : ""
    },
    delivery_address : {
        type : mongoose.Schema.ObjectId,
        ref : 'address'
    },
    subTotalAmt : {
        type : Number,
        default : 0
    },
    totalAmt : {
        type : Number,
        default : 0
    },
    invoice_recipt : {
        type : String,
        default : " "
    }
},{
    timestamps : true
})

const orderModel = mongoose.model('order',orderSchema)

export default orderModel
