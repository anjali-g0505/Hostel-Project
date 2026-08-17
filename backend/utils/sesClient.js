const { SESClient } = require('@aws-sdk/client-ses');
require('dotenv').config();

const sesClient = new SESClient({ //configured client object that can be used to make the senEmailCommand api call using the aws ses sdk
    region: process.env.AWS_SES_REGION,
    credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY
    }
});

module.exports = sesClient;
