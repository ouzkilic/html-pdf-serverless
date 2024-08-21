import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export const generatePdfBuffer = async (
  html: string,
): Promise<Buffer | undefined> => {
  let result = undefined
  let browser = null
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    })
    
    const page = await browser.newPage()

    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0', 'load'],
    })

    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')

    result = await page.pdf({ format: 'a4', printBackground: true })
  } catch (e) {
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }
  return result
}
