const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const cartItemSchema = Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    
    name: {
        type: String,
        minlength: [50, 'Panjang nama minimal 50 karakter'],
        required: [true, 'nama must be filled']
    },
    
    price: {
        type: Number,
        default: 0
    },
    
    image_url: String,

    qty: {
        type: Number,
        required: [true, 'qty harus diisi'],
        min: [1, 'minimal qty adalah 1']
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = model('CartItem', cartItemSchema);
