const mongoose = require('mongoose');
const {model, Schema} = mongoose;

let categorySchema = Schema({
    name: {
        type: String,
        minlength: [2, 'Panjang nama kategory minimal 2 karakter'],
        maxlength: [20, 'Panjang nama kategory maksimal 20 karakter'],
        required: [true, 'Panjang kategory harus diisi']
    }
})

module.exports = model('Category', categorySchema);