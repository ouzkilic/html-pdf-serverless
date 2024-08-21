import { Duration, Stack, StackProps, SecretValue } from 'aws-cdk-lib';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { ApiKey, ApiKeySourceType, LambdaIntegration, RestApi, UsagePlan } from 'aws-cdk-lib/aws-apigateway';

export class HtmlPdfServerlessStack extends Stack {
  constructor(scope: any, id: string, props?: StackProps) {
    super(scope, id, props);

    const pdfSecretCredentials = SecretValue.secretsManager('PDF_SECRETS');

    const chromeAwsLambdaLayer = new LayerVersion(this, 'ChromeAWSLambdaLayer', {
      layerVersionName: 'ChromeAWSLambdaLayer',
      compatibleRuntimes: [
        Runtime.NODEJS_18_X,
      ],
      code: Code.fromAsset('chromium-v110.0.0-layer.zip')
    })

    const htmlToPdfLambda = new NodejsFunction(this, 'HtmlToPdfLambda', {
      entry: 'lambdas/html-pdf-lambda/index.ts',
      layers: [chromeAwsLambdaLayer],
      bundling: {
        externalModules: [
          'aws-sdk'
        ],
        nodeModules: ['@sparticuz/chromium'],
      },
      environment: {
        PDF_SECRETS: pdfSecretCredentials.unsafeUnwrap().toString(),
      },
      timeout: Duration.seconds(30),
      runtime: Runtime.NODEJS_18_X,
      memorySize: 1024
    })

    const api = new RestApi(this, 'HtmlToPdfRestApi', {
      restApiName: 'HTML PDF API',
    })

    api.root.addMethod("POST", new LambdaIntegration(htmlToPdfLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    }))

  }
}


