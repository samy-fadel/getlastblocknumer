const Web3 = require('web3');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { PubSub } = require('@google-cloud/pubsub');
console.log(process.env.PROJECT_ID);

const pubsub = new PubSub({ projectId: process.env.PROJECT_ID });

async function getApiKey() {
  const secretName = `projects/${process.env.PROJECT_ID}/secrets/web3-api-key/versions/latest`;
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({ name: secretName });
  return version.payload.data.toString();
}
//com
async function publishLatestBlockNumber() {
  try {
    const topicName = 'latest-blocknumber-topic';
    const apiKey = await getApiKey();
    const web3 = new Web3(`http://json-rpc.2mnk2ypckfrt988whmbu8lc8n.blockchainnodeengine.com?key=${apiKey}`);
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
