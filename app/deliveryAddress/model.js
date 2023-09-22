const {Schema, model} = require('mongoose');

const deliveryAddressSchema = Schema({

    name: {
        type: String,
        required: [true, 'Nama alamat harus diisi'],
        maxlength: [255, 'Panjang maksimal nama alamat adalah 255 karakter']
    },

    kelurahan: {
        type: String,
        required: [true, 'Kelurahan harus diisi'],
        maxlength: [255, 'Panjang maksimal kelurahan adalah 255 karaker']
    },

    kecamatan: {
        type: String,
        required: [true, 'Kecamatan harus diisi'],
        maxlength: [255, 'Panjang maksimal Kecamatan adalah 255 karaker']
    },

    kabupaten: {
        type: String,
        required: [true, 'Kabupaten harus diisi'],
        maxlength: [255, 'Panjang maksimal Kabupaten adalah 255 karaker']
    },

    provinsi: {
        type: String,
        required: [true, 'Provinsi harus diisi'],
        maxlength: [1000, 'Panjang maksimal Provinsi adalah 1000 karaker']
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
}, {timestamps: true});

module.exports = model('DeliveryAddress', deliveryAddressSchema);