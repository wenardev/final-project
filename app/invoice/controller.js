const { subject } = require('@casl/ability');
const Invoice = require('../invoice/model');
const { policyFor } = require('../../utils');

const show = async (req, res, next) => {
    try {
        let { order_id } = req.params;
        let invoice = await Invoice
            .findOne({ order: order_id })
            .populate('order')
            .populate('user');
        
        if (!invoice) {
            return res.status(404).json({
                error: 1,
                message: `Invoice tidak ditemukan.`
            });
        }

        let policy = policyFor(req.user);
        let subjectInvoice = subject('Invoice', { user_id: invoice.user._id });

        if (!policy.can('read', subjectInvoice)) {
            return res.status(403).json({
                error: 1,
                message: `Anda tidak memiliki akses untuk melihat invoice ini.`
            });
        }
    
        
        return res.json(invoice);
    } catch (err) {
        console.error(err); // Tampilkan kesalahan pada konsol server
        return res.status(500).json({
            error: 1,
            message: `Terjadi kesalahan saat mengambil invoice.`
        });
    }
}

module.exports = {
    show
}
