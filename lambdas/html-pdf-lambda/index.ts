import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { generatePdfBuffer } from './generatePdfBuffer'

const { PDF_SECRETS } = process.env;
const { pdf_api_key } = JSON.parse(PDF_SECRETS as string);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: "Invalid request body"
        }
    }
    try {
        const apiKey = event.headers['x-api-key']
        if (apiKey !== pdf_api_key) {
            return {
                statusCode: 403,
                body: "Unauthorized"
            }
        }
    
        const requestBody = JSON.parse(event.body) as { html: string }

        const pdfBuffer = await generatePdfBuffer(requestBody.html)

        if(!pdfBuffer) {
            throw new Error('Failed to created PDF buffer from HTML')
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                base64: pdfBuffer.toString('base64')
            })
        }
    } catch (error) {
        console.log("Error converting HTML to PDF", error)
        return {
            statusCode: 500,
            body: "Internal server error"
        }
    }
}
