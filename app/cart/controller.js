const Product = require('../product/model');
const User = require('../user/model');
const CartItem = require('../cart-item/model');

const update = async (req, res, next) => {
    try {
    const { items } = req.body;
    const productIds = items.map((item) => item.product._id);
    const products = await Product.find({ _id: { $in: productIds } });

    const cartItems = items.map((item) => {
        const relatedProduct = products.find(
        (product) => product._id.toString() === item.product._id
        );
        return {
        product: relatedProduct._id,
        price: relatedProduct.price,
        image_url: relatedProduct.image_url,
        name: relatedProduct.name,
        user: req.user._id,
        qty: item.qty,
        };
    });
      // Jangan hapus item keranjang yang ada, tambahkan item baru jika sudah ada
    await CartItem.bulkWrite(
        cartItems.map((item) => ({
        updateOne: {
            filter: {
            user: req.user._id,
            product: item.product,
            },
            update: item,
            upsert: true,
        },
        }))
    );

    const updatedItems = await CartItem.find({ user: req.user._id }).populate(
        'product'
    );

    return res.json(updatedItems);
    } catch (err) {
    if (err && err.name === 'ValidationError') {
        return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
        });
    }
    next(err);
    }
};  

const index = async (req, res, next) => {
    try {
        let items = await CartItem.find({ user: req.user._id }).populate('product');
        let totalItems = items.reduce((total, item) => total + item.qty, 0); // Menghitung total produk dalam keranjang

        return res.json({
            items: items,
            totalItems: totalItems, // Mengirimkan total produk dalam keranjang dalam respons
        });
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors,
            });
        }
        next(err);
    }
};

const destroy = async (req, res, next) => {
    try {
        const itemId = req.params.itemId; // Dapatkan ID item yang akan dihapus
        const userId = req.user._id; // Dapatkan ID pengguna yang sedang login

        // Hapus item dari keranjang belanja pengguna dengan ID item yang sesuai dan ID pengguna yang sesuai
        const result = await CartItem.deleteOne({ _id: itemId, user: userId });

        if (result.deletedCount === 1) {
            // Item berhasil dihapus
            return res.json({ success: true, message: 'Item berhasil dihapus dari keranjang belanja.' });
        } else {
            // Item tidak ditemukan atau gagal dihapus
            return res.status(404).json({ success: false, message: 'Item tidak ditemukan atau gagal dihapus.' });
        }
    } catch (err) {
        // Tangani kesalahan jika terjadi
        if (err && err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: err.message,
                fields: err.errors,
            });
        }
        next(err);
    }
};

module.exports = {
    update,
    index,
    destroy
}