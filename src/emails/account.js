const sgMail = require('@sendgrid/mail');

const from = 'alalmy475@gmail.com';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async (email, name) => {
  try {
    const result = await sgMail.send({
      to: email,
      from,
      subject: 'You signed-up successfully🎉✨',
      text: `Welcome to our web-app ${name}`,
    });

    // console.log(result);
    console.log('Sign-up email sent successfully.');
  } catch (err) {
    console.log(err.message);
  }
};

const sendCancelationEmail = async (email, name) => {
  try {
    const result = await sgMail.send({
      to: email,
      from,
      subject: 'Sorry to see you go!',
      text: `Goodbye, ${name}. I hope to see you back sometime soon.`,
    });

    // console.log(result);
    console.log('Delete email sent successfully.');
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
