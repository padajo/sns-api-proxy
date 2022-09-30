// Import all functions from sns-payload-logger.js
const snsApiProxy = require('../../../src/handlers/snsApiProxy.js');

const original_a = process.env.TOPIC_REQUEST_NAME;
const original_a2 = process.env.TOPIC_REQUEST_ARN;
const original_b = process.env.TOPIC_RESPONSE_NAME;
const original_b2 = process.env.TOPIC_RESPONSE_ARN;

/*** MOCK the AWS SDK and SNS publish functions */
const mockSNSClient = {
    publish: jest.fn().mockReturnThis()
};

const publishSpy = jest.spyOn(mockSNSClient, 'publish');

jest.mock('aws-sdk', () => ({
    SNS: jest.fn(
        () => mockSNSClient
    )
}));

beforeEach(() => {
    process.env.TOPIC_REQUEST_NAME = 'A';
    process.env.TOPIC_REQUEST_ARN = 'B';
    process.env.TOPIC_RESPONSE_NAME = 'C';
    process.env.TOPIC_RESPONSE_ARN = 'D';
});

afterEach(() => {
    process.env.TOPIC_REQUEST_NAME = original_a;
    process.env.TOPIC_REQUEST_ARN = original_a2;
    process.env.TOPIC_RESPONSE_NAME = original_b;
    process.env.TOPIC_RESPONSE_ARN = original_b2;
});

describe('Test for snsproxy', function () {
    // This test invokes the sns-payload-logger Lambda function and verifies that the received payload is logged
    it('Basic Test to check it logs the request', async() => {
        
        // Mock console.log statements so we can verify them. For more information, see
        // https://jestjs.io/docs/en/mock-functions.html

        const logSpy = jest.spyOn(console, 'log');
        const logInfoSpy = jest.spyOn(console, 'info');

        // Create a sample payload with SNS message format
        // this will fail because it's 
        var payload = {
            TopicArn: process.env.TOPIC_REQUEST_ARN,
            Message: "This is a notification from SNS",
            Subject: "API Proxy Request"
        };

        await snsApiProxy.handler(payload, null);

        // Verify that console.info has been called with the expected payload
        expect(logInfoSpy).toHaveBeenCalledWith(payload);
        // expect(logInfoSpy).toHaveBeenCalledWith(process.env.TOPIC_REQUEST_NAME);
        // expect(logInfoSpy).toHaveBeenCalledWith(process.env.TOPIC_REQUEST_ARN);
        // expect(logInfoSpy).toHaveBeenCalledWith(process.env.TOPIC_RESPONSE_NAME);
        // expect(logInfoSpy).toHaveBeenCalledWith(process.env.TOPIC_RESPONSE_ARN);

        expectedParams = {
            TopicArn: process.env.TOPIC_RESPONSE_ARN,
            Message: JSON.stringify({help:"You must specify a 'clientId' to use this API."}),
            MessageStructure: "json",
            MessageAttributes: {
                error: false,
                help: true,
                request: JSON.stringify({})
            }
        };
        console.log(expectedParams);

        expect(publishSpy).toHaveBeenCalledWith(expectedParams);

        
    });
});

describe('Test for snsproxy', function () {
    // This test invokes the sns-payload-logger Lambda function and verifies that the received payload is logged
    it('Basic Test to check it logs the request', async() => {
        
        // Mock console.log statements so we can verify them. For more information, see
        // https://jestjs.io/docs/en/mock-functions.html

        const logSpy = jest.spyOn(console, 'log');
        const logInfoSpy = jest.spyOn(console, 'info');

        // Create a sample payload with SNS message format
        // this will fail because it's 
        var payload = {
            TopicArn: process.env.TOPIC_REQUEST_ARN,
            Message: JSON.stringify(
                {
                    attr: "This is where any attributes to a specified API would go and could be validated"
                }
            ),
            MessageStructure: "json",
            Subject: "API Proxy Request",
            MessageAttributes: {
                "clientId": "testClientId" // THIS IS WHERE THE CLIENT ID SHOULD GO
            }
        };


        await snsApiProxy.handler(payload, null);

        // Verify that console.info has been called with the expected payload
        expect(logInfoSpy).toHaveBeenCalledWith(payload);

        
    });
});
