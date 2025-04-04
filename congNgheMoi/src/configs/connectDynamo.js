require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
console.log("Connect to DynamoDB");

module.exports = dynamoDB;
