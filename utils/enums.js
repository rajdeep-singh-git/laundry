exports.MESSAGES = {
    INVALID_CREDENTIALS: "Invalid username or password",
    STATUS_UPDATED: "Status updated successfully",
    BATCH_NOT_FOUND: "Batch not found",
    CLIENT_ADDED: "Client added successfully",
    CLIENT_UPDATED: "Client updated successfully",
    BATCH_ADDED: "Batch added successfully",
    BATCH_UPDATED: "Batch updated successfully",
    PHONE_EXISTS: "Phone already exists",
    EMAIL_EXISTS: "Email already exists",
    BAD_REQUEST: "Bad Request",
    CLIENT_NOT_FOUND: "Client does not exist"
}


exports.CONFIGURATIONS = {
    LATE_PICKUP_FEE: 'late_pickup_fee',
    TAX_ON_BILL: 'tax_on_bill',
    LATE_DAYS: 'late_days'
}

exports.BATCH_STATUS = {
    DELIVERED: 'Delivered',
    DRIED: 'Dried',
    DRYING: 'Drying',
    FOLDING_AND_PACKING: 'Folding and Packing',
    IRONED: 'Ironed',
    IRONING: 'Ironing',
    READY_FOR_PICKUP: 'Ready for Pickup',
    WAITING_FOR_PROCESSING: 'Waiting for Processing',
    WASHED: 'Washed',
    WASHING: 'Washing',
    CANCELLED: 'Cancelled'
}

exports.ROLES = {
    ADMIN: "admin",
    CLIENT: "client"
}

exports.USERS_COLUMMS = {
    ID: "id",
    NAME: "name",
    USERNAME: "username",
    //PASSWORD: "password",
    EMAIL: "email",
    PHONE: "phone",
    CITY: "city",
    STATE: "state",
    //ROLE: "role"
}

exports.ORDER_BY_STATUSES = {
    ASC: "ASC",
    DESC: "DESC"
}