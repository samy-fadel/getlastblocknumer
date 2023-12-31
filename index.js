const Web3 = require('web3');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { PubSub } = require('@google-cloud/pubsub');
console.log('projet id ' , process.env.PROJECT_ID);

const pubsub = new PubSub({ projectId: process.env.PROJECT_ID });

async function getApiKey() {
  const secretName = `projects/${process.env.PROJECT_NUMBER}/secrets/web3-api-key/versions/latest`;
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({ name: secretName });
  console.log("line 12");
  console.log(version.payload.data.toString());
  return version.payload.data.toString();
}

async function publishLatestBlockNumber() {
  try {
    const topicName = 'latest-blocknumber-topic';
    const apiKey = await getApiKey();
    console.log(apiKey);
    const web3 = new Web3(`https://mainnet.infura.io/v3/${apiKey}`);
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('Latest block number:', blockNumber);
    const data = Buffer.from(JSON.stringify({ blockNumber }));
    await pubsub.topic(topicName).publish(data);
    console.log('Latest block number published to Pub/Sub topic:', blockNumber);
  } catch (error) {
    console.error('Error publishing latest block number:', error);
  }
}

publishLatestBlockNumber();
