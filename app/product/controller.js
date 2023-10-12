const path = require('path');
const fs = require('fs').promises; // Menggunakan versi asinkron dari fs
const config = require('../config');
const Product = require('./model');
const Category = require('../category/model');
const Tag = require('../tag/model');

const store = async (req, res, next) => {
    try {
        let payload = req.body;
        if (payload.category) {
            const category = await Category.findOne({
                name: { $regex: payload.category, $options: 'i' }
            });
            if (category) {
                payload = { ...payload, category: category._id };
            } else {
                delete payload.category;
            }
        }
        if (payload.tags && payload.tags.length > 0) {
            const tags = await Tag.find({ name: { $in: payload.tags } });
            if (tags.length) {
                payload = { ...payload, tags: tags.map(tag => tag._id) };
            } else {
                delete payload.tags;
            }
        }
        if (req.file) {
            const tmp_path = req.file.path;
            const originalExt = req.file.originalname.split('.').pop();
            const filename = `${req.file.filename}.${originalExt}`;
            const target_path = path.resolve(config.rootPath, 'public', 'images', 'products', filename);
            await fs.rename(tmp_path, target_path); // Menggunakan fs.promises.rename
            let product = new Product({ ...payload, image_url: filename });
            await product.save();
            return res.json(product);
        } else {
            let product = new Product(payload);
            await product.save();
            return res.json(product);
        }
    } catch (err) {
        handleValidationError(err, res, next);
    }
};

const update = async (req, res, next) => {
    try {
        let payload = req.body;
        let { id } = req.params;
        //relasi dengan category
        if(payload.category){
            let category =
            await Category 
            .findOne({name: {$regex: payload.category, $options: 'i'}});
            if(category){
                payload = {...payload, category: category._id};
            } else {
                delete payload.category;
            }
        }
        //relasi dengan tag
        if(payload.tags && payload.tags.length > 0){
            let tags =
            await Tag 
            .find({name: {$in: payload.tags}});
            if(tags.length){
                payload = {...payload, tags: tags.map(tag => tag._id)};
            } else {
                delete payload.tags;
            }
        }
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 1, message: "Product not found" });
        }
        if (req.file) {
            const tmp_path = req.file.path;
            const originalExt = req.file.originalname.split('.').pop();
            const filename = `${req.file.filename}.${originalExt}`;
            const target_path = path.resolve(config.rootPath, 'public', 'images', 'products', filename);
            await fs.rename(tmp_path, target_path);
            // Hapus gambar lama jika ada
            if (product.image_url) {
                const oldImagePath = path.resolve(config.rootPath, 'public', 'images', 'products', product.image_url);
                try {
                    await fs.unlink(oldImagePath);
                } catch (err) {
                    console.error("Error deleting old image:", err);
                }
            }
            let updatedProduct = await Product.findByIdAndUpdate(id, { ...payload, image_url: filename }, {
                new: true,
                runValidators: true
            });
            return res.json(updatedProduct);
        } else {
            let updatedProduct = await Product.findByIdAndUpdate(id, payload, {
                new: true,
                runValidators: true
            });
            return res.json(updatedProduct);
        }
    } catch (err) {
        handleValidationError(err, res, next);
    }
};

const index = async (req, res, next) => {
    try {
        let { skip = 0, limit = 10, q = '', category = '', tags = [] } = req.query;
        let criteria = {};
        if(q.length){
            criteria = {
                ...criteria,
                name: {$regex: `${q}`, $options: 'i'}
            }
        }
        if(category.length){
            let categoryResult = await Category.findOne({name: {$regex: `${category}`}, $options: 'i'});
            if(categoryResult) {
                criteria = {...criteria, category: categoryResult._id}
            }
        }
        if(tags.length){
            let tagsResult = await Tag.find({name: {$in: tags}});
            if(tagsResult.length > 0) {
                criteria = {...criteria, tags: {$in: tagsResult.map(tag => tag._id)}}
            }
        }
        let count = await Product.find().countDocuments();
        let product = await Product
        .find(criteria)
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .populate('category')
        .populate('tags');
        return res.json({
            data: product,
            count
        });
    } catch (err) {
        next(err);
    }
}

const destroy = async (req, res, next) => {
    try {
        let product = await Product.findByIdAndDelete(req.params.id);
        let currentImage = path.resolve(config.rootPath, 'public', 'images', 'products', product.image_url);
        if (await fs.access(currentImage).catch(() => false)) {
            await fs.unlink(currentImage);
        }
        return res.json(product);
    } catch (err) {
        next(err);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category').populate('tags');
        if (!product) {
            return res.status(404).json({ error: 1, message: "Product not found" });
        }
        return res.json(product);
    } catch (err) {
        next(err);
    }
};

// Helper function to handle validation errors
const handleValidationError = (err, res, next) => {
    if (err.name === 'ValidationError') {
        return res.json({
            error: 1,
            message: err.message,
            fields: err.errors
        });
    }
    next(err);
};

module.exports = {
    store,
    index,
    update,
    destroy,
    getProductById,
    handleValidationError
};
