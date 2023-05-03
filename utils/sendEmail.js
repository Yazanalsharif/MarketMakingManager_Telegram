const sgMail = require("@sendgrid/mail");
require("dotenv").config({ path: "./config/.env" });
//setting the apiKey which the app will be connected with the services provider.
const apiKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(apiKey);

// html: "<strong>and easy to do anywhere, even with Node.js</strong>",
const sendMail = async (options, attachment) => {
  try {
    const msg = {
      to: options.email,
      from: "yazan.s@burency.com", // Use the email address or domain you verified above
      subject: `${options.name} <${options.email}>`,
      text: `This Message Came From Burency.io:\n \n ${options.message}`,
      //   attachments: [
      //     {
      //       content: attachment,
      //       filename: "attachment.pdf",
      //       type: "application/pdf",
      //       disposition: "attachment",
      //     },
      //   ],
    };

    return await sgMail.send(msg);
  } catch (error) {
    //send message that we are not able to send messages now try again later

    console.log(error);
  }
};

module.exports = { sendMail };
