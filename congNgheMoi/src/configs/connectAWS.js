require("dotenv").config();
import { config, DynamoDB } from "aws-sdk";

config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const dynamoDB = new DynamoDB.DocumentClient();
console.log("Connected to DynamoDB");

export default dynamoDB;
