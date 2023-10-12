exports.EMAIL_SUBJECTS = {
    BATCH_READY_FOR_PICKUP: "Batch is ready for pickup",
    BATCH_DELIVERED: "Batch Delivered",
    BATCH_CANCELLED: "Batch Cancelled"
}

exports.EMAIL_TEMPLATES = {
    BATCH_READY_FOR_PICKUP: `Hi {{name}},<br>Your batch of {{count}} clothes is ready to pickup at {{datetime}} at our laundry.
    <br>
    Please be available to pickup otherwise after {{fineAfterDays}} days there will be fine of ${'$'}{{fine}}.
    <br>
    Thanks and Regards
    <br>
    CEO Laundry company`,
    BATCH_DELIVERED: `Hi {{name}},<br>Your batch of {{count}} clothes is delivered today at {{datetime}} at our laundry.
    <br>
    Thanks and Regards
    <br>
    CEO Laundry company`,
    BATCH_CANCELLED: `Hi {{name}},<br>Your batch with {{count}} clothes was cancelled at {{datetime}}.
    <br>
    Thanks and Regards
    CEO Laundry company    
    `
}

/**
 * Get email template with replaced values like name,count and datetime etc
 * @param {*} template 
 * @param {*} config 
 * @returns 
 */
exports.getEmailTemplate = (template, config) => {
    let templateContent = template;

    for (let [key, value] of Object.entries(config)) {
        templateContent = templateContent.replace(`{{${key}}}`, value);
    }

    return templateContent;
}   