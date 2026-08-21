const { SendEmailCommand } = require('@aws-sdk/client-ses');
const sesClient = require('./sesClient');

// Thrown by sendEmail so we can verify why it failed instead of just catching a generic Error.
class EmailSendError extends Error {
    constructor(reason, message, cause) {
        super(message); //super calls the base class constructor (Error) with the message parameter. This si compulsory to create an object of the derived class (EmailSendError)
        this.name = 'EmailSendError';
        this.reason = reason; // 'VALIDATION_ERROR' | 'SES_REJECTED' | 'REQUEST_NOT_SENT'
        this.cause = cause;
    }
}

// Shared by email verification, resend-verification, and forgot-password,
// so the SES payload shape and error handling only live in one place.
const sendEmail = async ({ to, subject, html, text }) => {
    console.log(`(sendEmail) NODE_ENV="${process.env.NODE_ENV}", sender="${process.env.SES_SENDER_EMAIL}", to="${to}"`);

    if (!to || !subject || (!html && !text)) { //need one of html or text
        throw new EmailSendError('VALIDATION_ERROR', 'sendEmail requires "to", "subject", and either "html" or "text".'); //trhow is used with a try/catch
    }

    const params = {
        Source: process.env.SES_SENDER_EMAIL,
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: {
                ...(html && { Html: { Data: html, Charset: 'UTF-8' } }),
                ...(text && { Text: { Data: text, Charset: 'UTF-8' } })
            }
        }
    };

    // While NODE_ENV is 'development', never call SES - log what would have been sent instead.
    // Flip this once the pipeline is ready to actually send.
    if (process.env.NODE_ENV === 'development') {
        console.log('(Dev mode) Email not sent - logging instead ---');
        console.log('To:', to);
        console.log('Subject:', subject);
        if (text) console.log('Text Body:', text);
        if (html) console.log('HTML Body:', html);
        console.log('----------------------------------------------------');
        return { success: true, dryRun: true };
    }

    try {
        const response = await sesClient.send(new SendEmailCommand(params));
        console.log(`(SES) Email sent to ${to} - messageId: ${response.MessageId}`);
        return { success: true, dryRun: false, messageId: response.MessageId };
    } catch (err) {
        // If SES's response metadata came back, the request reached SES and SES rejected it
        // (bad/unverified sender, throttling, malformed address, etc). No metadata means the
        // request never made it to SES at all (network failure, DNS, timeout).
        if (err?.$metadata?.httpStatusCode) {
            console.error(`(SES) Rejected email to ${to} - status ${err.$metadata.httpStatusCode}, code ${err.name}: ${err.message}`);
            throw new EmailSendError('SES_REJECTED', `SES rejected the email: ${err.message}`, err);
        }
        console.error(`(SES) Could not reach SES for email to ${to}:`, err.message);
        throw new EmailSendError('REQUEST_NOT_SENT', `Could not reach SES: ${err.message}`, err);
    }
};

module.exports = {
    sendEmail,
    EmailSendError
};
