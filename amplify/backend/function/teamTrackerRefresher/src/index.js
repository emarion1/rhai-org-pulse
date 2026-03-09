const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { refreshPersonMetrics } = require('./app');

const ssmClient = new SSMClient({ region: process.env.REGION || 'us-east-1' });

exports.handler = async function (event) {
  console.log('Refresher Lambda invoked:', JSON.stringify(event));

  const { type, members, force } = event;

  if (!type || !Array.isArray(members) || members.length === 0) {
    console.error('Invalid event: expected { type, members[] }');
    return { statusCode: 400, body: 'Invalid event format' };
  }

  const paramName = process.env.JIRA_TOKEN_PARAMETER_NAME
    || `/team-tracker-app/${process.env.ENV || 'dev'}/jira-token`;

  try {
    const ssmCommand = new GetParameterCommand({
      Name: paramName,
      WithDecryption: true
    });
    const ssmResponse = await ssmClient.send(ssmCommand);
    const jiraToken = ssmResponse.Parameter.Value;

    await refreshPersonMetrics({ jiraToken, members, force: !!force });

    return { statusCode: 200, body: `Refreshed ${members.length} members (${type})` };
  } catch (error) {
    console.error('Refresher Lambda error:', error);
    throw error;
  }
};
