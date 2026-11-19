const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureLiveBars() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  const dir = path.resolve('public/screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Overview Screen
  console.log('Navigating to Overview...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const ticket = await page.$('.kf-ledger-ticket');
  if (ticket) {
    await ticket.screenshot({ path: path.join(dir, 'live_overview_ticket_approved.png') });
    console.log('Saved live_overview_ticket_approved.png');
  }

  // Click "Blocked" pill on ticket
  const blockedBtn = await page.$('button.kf-switch-chip:has-text("Blocked"), button:has-text("Blocked")');
  if (blockedBtn) {
    await blockedBtn.click();
    await page.waitForTimeout(400);
    if (ticket) {
      await ticket.screenshot({ path: path.join(dir, 'live_overview_ticket_blocked.png') });
      console.log('Saved live_overview_ticket_blocked.png');
    }
  }

  // 2. Workspace Screen (CommandCenter)
  console.log('Navigating to Workspace...');
  await page.click('button.kf-nav-tab:has-text("Workspace")');
  await page.waitForTimeout(600);
  
  // Click "Bidding log" tab
  const biddingLogBtn = await page.$('button:has-text("Bidding log")');
  if (biddingLogBtn) {
    await biddingLogBtn.click();
    await page.waitForTimeout(500);
  }
  
  const cnpWrap = await page.$('.kf-cnp-chart-wrap');
  if (cnpWrap) {
    await cnpWrap.screenshot({ path: path.join(dir, 'live_workspace_cnp_bars.png') });
    console.log('Saved live_workspace_cnp_bars.png');
  }
  
  const cnpTabPanel = await page.$('.kf-tab-panel');
  if (cnpTabPanel) {
    await cnpTabPanel.screenshot({ path: path.join(dir, 'live_workspace_cnp_panel.png') });
    console.log('Saved live_workspace_cnp_panel.png');
  }

  // 3. Risk Study Screen (Backtest)
  console.log('Navigating to Risk Study...');
  await page.click('button.kf-nav-tab:has-text("Risk Study")');
  await page.waitForTimeout(600);

  // Scroll down to the bottom split cards
  await page.evaluate(() => window.scrollBy(0, 650));
  await page.waitForTimeout(500);

  const backtestSplit = await page.$('.kf-backtest-split');
  if (backtestSplit) {
    await backtestSplit.screenshot({ path: path.join(dir, 'live_risk_study_split.png') });
    console.log('Saved live_risk_study_split.png');
  }

  await browser.close();
  console.log('Finished capturing all live bars.');
}

captureLiveBars().catch((err) => {
  console.error('Error capturing bars:', err);
  process.exit(1);
});
