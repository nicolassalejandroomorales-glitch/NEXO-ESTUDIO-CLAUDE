// Recorre las explicaciones reales antes de las comprobaciones antiguas.
module.exports = async function studyJourney(page) {
  const pages = await page.evaluate(() => window.NexoClasses['org-01'].missions.find(m => m.id === 'm4').study.pages);
  for (const part of pages) {
    await page.getByRole('heading', { name: part.title, exact: true }).waitFor();
    if (part.check && !await page.locator('.st-opt').first().isDisabled()) {
      await page.locator(`.st-opt[data-i="${part.check.options.findIndex(o => o.correct)}"]`).click();
    }
    await page.getByRole('button', { name: part === pages[pages.length - 1] ? 'Comprobar lo aprendido →' : 'Continuar →', exact: true }).click();
  }
};
