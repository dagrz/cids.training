import { chromium } from 'playwright';
import path from 'path';

async function generatePDF() {
  const htmlPath = path.resolve(__dirname, '../src/pdf/cids-guide.html');
  const outputPath = path.resolve(__dirname, '../public/cids-framework-guide.pdf');

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`Loading HTML from: ${htmlPath}`);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  console.log(`Generating PDF to: ${outputPath}`);
  await page.pdf({
    path: outputPath,
    format: 'A5',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });

  await browser.close();
  console.log('PDF generated successfully!');
}

generatePDF().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
