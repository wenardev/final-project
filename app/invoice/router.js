const express = require('express');
const router = express.Router();
const invoiceController = require('./controller'); // Pastikan controller telah didefinisikan dan eksport

router.get('/invoice', (req, res) => {
    // Fungsi callback untuk route ini
    invoiceController.index(req, res); // Panggil fungsi index dari controller
});

module.exports = router;
