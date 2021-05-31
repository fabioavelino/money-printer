var admin = require("firebase-admin");
const { registrationToken } = require("./key");

// This registration token comes from the client FCM SDKs.

var serviceAccount = require("./cryptowatch-6ed8c-firebase-adminsdk-4t05w-26a56a9476.json");

const sendNotification = async (title, body, data = {}) => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cryptowatch-6ed8c.firebaseio.com",
  });
  console.log("sending message");
  var message = {
    notification: {
      title,
      body,
    },
    data,
    token: registrationToken,
  };

  // Send a message to the device corresponding to the provided
  // registration token.
  try {
    await admin.messaging().send(message);
  } catch (error) {}
  admin.apps.forEach((app) => app.delete());
};

module.exports = { sendNotification };
