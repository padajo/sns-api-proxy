const aws = require('aws-sdk');
const axios = require('axios');
/**
 * A Lambda function that logs the payload received from SNS.
 */
exports.handler = async (event, context) => {
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.info(event);
    // console.info(process.env.TOPIC_REQUEST_NAME);
    // console.info(process.env.TOPIC_REQUEST_ARN);
    // console.info(process.env.TOPIC_RESPONSE_NAME);
    // console.info(process.env.TOPIC_RESPONSE_ARN);

    /*
    - sent to the topic will generate a response on the response topic
    - with the `help` attribute set to `true` will return a message with information on how to use the interface
    - without a `clientId` attribute will generate the same response as with the `help` attribute but without the `clientId` specified
    - with a `clientId` will have the same `clientId` returned as an attribute
    - specifying the `clientId` in the subscription filter policy on the response subscription is the expected method for users of the interface to avoid recieving all the other responses on the topic
    - will expect to have the data as specified in the `help` information
    - without the data specified in the `help` will receive an error message and any relevant details about the error
    */
    // console.info(event.help);
    // console.info(event.clientId);

    var sns = new aws.SNS();

    requestAttributes = {};

    var clientId = null;

    if(!(event.MessageAttributes == undefined)) {
        requestAttributes = event.MessageAttributes;
        clientId = requestAttributes.clientId;
    }

    console.log(clientId);

    if(event.help == true || clientId == undefined) {
        // send the help command to the response queue

        
        const params = {
            TopicArn: process.env.TOPIC_RESPONSE_ARN,
            Message: JSON.stringify({help:"You must specify a 'clientId' to use this API."}),
            MessageStructure: "json",
            MessageAttributes: {
                error: false,
                help: true,
                request: JSON.stringify(requestAttributes)
            }
            
        }

        console.log(params);

        const response = await sns.publish(params);
        
    } else {
        // we know now that the clientId is specified and that this is not a request for help with the API

        // now we have a client ID
        // get a cat fact
        const url = "https://catfact.ninja/fact";

        const apiResponse = await axios.get(url);

        // response.data is the API response

        requestAttributes.input = event.Message;

        const params = {
            TopicArn: process.env.TOPIC_RESPONSE_ARN,
            Message: JSON.stringify({
                catFact: apiResponse.data.fact,
                ApiUrl: url
            }),
            MessageStructure: "json",
            MessageAttributes: {
                clientId: clientId,
                error: false,
                help: false,
                request: JSON.stringify(requestAttributes)
            }
        };
        
        console.log(params);

        const response = await sns.publish(params);

    }

}
