const MESSAGES = {
    "INVALID_CREDENTIALS": "Invalid username or password",
    "STATUS_UPDATED": "Status updated successfully",
    "BATCH_NOT_FOUND": "Batch not found",
    "CLIENT_ADDED": "Client added successfully",
    "BATCH_ADDED": "Batch added successfully"
}

exports.MESSAGES = MESSAGES;

exports.CONFIGURATIONS = {
    LATE_PICKUP_FEE: 'late_pickup_fee',
    TAX_ON_BILL: 'tax_on_bill',
    LATE_DAYS: 30
}

exports.BATCH_STATUS = {
    DELIVERED: 'Delivered',
    DRIED: 'Dried',
    DRYING: 'Drying',
    FOLDING_AND_PACKING: 'Folding and Packing',
    IRONED: 'Ironed',
    IRONING: 'Ironing',
    READY_FOR_PICKUP: 'Ready for Pickup',
    WAITING_FOR_WASHING: 'Waiting for Washing',
    WASHED: 'Washed',
    WASHING: 'Washing'
}