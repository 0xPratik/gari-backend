var AWS = require("aws-sdk");
var fs = require("fs");

var ssm = new AWS.SSM({ region: process.env.AWS_REGION });

const main = async () => {
  try {
    const envs = [
      "PRICE",
      "FEE_PAYER_ADDRESS",
      "ENDPOINT",
      "GARI_TOKEN_MINT",
      "GARI_TREASURY_ATA",
      "UPDATE_AUTHORITY",
      "UPDATE_AUTHORITY",
      "PORT",
    ];
    var writeStream = fs.createWriteStream(".env");

    console.log("ENVIRONMENT", process.env.ENVIRONMENT);

    await Promise.all(
      envs.map(async (elt) => {
        console.log(`/${process.env.ENVIRONMENT}/NFT/${elt}`);
        let data = await ssm
          .getParameter({
            Name: `/${process.env.ENVIRONMENT}/NFT/${elt}`,
            WithDecryption: true,
          })
          .promise()
          .catch((error) => console.log(error, elt));

        writeStream.write(`${elt}=${data.Parameter.Value}\n`);

        return data;
      })
    );
    writeStream.end();
  } catch (error) {
    console.log(error);
  }
};
main();
