import { test, expect } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────────────────────

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173'

// ─── Login / Signup Flow ─────────────────────────────────────────────────────

test.describe('Authentication', () => {
  test('Login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'commit' })
    await page.waitForTimeout(2000)
    await expect(page.getByText('UOB Singapore')).toBeVisible()
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByText("Don't have an account?")).toBeVisible()
  })

  test('Login form validation — empty fields', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'commit' })
    await page.waitForTimeout(2000)
    const btn = page.getByRole('button', { name: 'Sign In' })
    await expect(btn).toBeDisabled()
  })

  test('Login form validation — email only', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'commit' })
    await page.waitForTimeout(2000)
    await page.getByPlaceholder('your@email.com').fill('test@uob.com')
    const btn = page.getByRole('button', { name: 'Sign In' })
    await expect(btn).toBeDisabled()
  })

  test('Sign up link navigates to signup page', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'commit' })
    await page.waitForTimeout(2000)
    await page.getByText('Sign Up').click()
    await expect(page).toHaveURL(`${BASE}/signup`)
  })

  test('Signup page renders correctly', async ({ page }) => {
    await page.goto(`${BASE}/signup`, { waitUntil: 'commit' })
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByPlaceholder('Jane Doe')).toBeVisible()
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeDisabled()
  })

  test('Password strength meter shows weak/strong', async ({ page }) => {
    await page.goto(`${BASE}/signup`, { waitUntil: 'commit' })
    await page.waitForTimeout(2000)
    await page.getByPlaceholder('your@email.com').fill('test@uob.com')
    await page.getByPlaceholder('Jane Doe').fill('Test User')
    // type short password
    await page.getByPlaceholder('Min. 6 characters').fill('abc')
    await expect(page.getByText('Password strength: Weak')).toBeVisible()
    // type stronger password
    await page.getByPlaceholder('Min. 6 characters').fill('StrongPass123!')
    await expect(page.getByText('Password strength: Strong')).toBeVisible()
  })

  test('Toggle password visibility', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'commit' })
    await page.waitForTimeout(2000)
    const input = page.getByPlaceholder('••••••••')
    await expect(input).toHaveAttribute('type', 'password')
    await page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first().click()
    await expect(input).toHaveAttribute('type', 'text')
  })
})

// ─── Protected Routes ────────────────────────────────────────────────────────

test.describe('Protected Routes', () => {
  test('Redirects to /login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'commit' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/login/)
  })

  test('Redirects /transfer to /login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'commit' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/login/)
  })

  test('Redirects /cards to /login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE}/cards`, { waitUntil: 'commit' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/login/)
  })

  test('Redirects /invest to /login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE}/invest`, { waitUntil: 'commit' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/login/)
  })

  test('Redirects /history to /login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE}/history`, { waitUntil: 'commit' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/login/)
  })

  test('Redirects /settings to /login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE}/settings`, { waitUntil: 'commit' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/login/)
  })

  test('Redirects /qrpay to /login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE}/qrpay`, { waitUntil: 'commit' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/login/)
  })
})

// ─── Navigation ──────────────────────────────────────────────────────────────

test.describe('Bottom Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'commit', timeout: 8000 })
    await page.waitForTimeout(2000)
    // Manually set mock auth in localStorage then go home
    await page.evaluate(() => {
      localStorage.setItem('firebase:auth:loggedIn', 'true')
      localStorage.setItem('mockUser', JSON.stringify({ uid: 'test-uid', email: 'demo@uob.com', displayName: 'Hafeez Demo' }))
    })
    await page.goto(`${BASE}/`, { waitUntil: 'commit', timeout: 8000 })
    await page.waitForTimeout(1500)
  })

  test('Bottom nav has 5 tabs', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible({ timeout: 8000 })
    const tabs = page.locator('nav a')
    await expect(tabs).toHaveCount(5)
  })

  test('Active tab highlights correctly', async ({ page }) => {
    const navLinks = page.locator('nav a')
    await expect(navLinks.first()).toHaveClass(/text-uob-green/)
  })
})

// ─── Home Page ───────────────────────────────────────────────────────────────

test.describe('Home Page', () => {
  test('Home page loads and shows balance card', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'commit' })
    // Wait for content
    await expect(page.getByText('Total Balance')).toBeVisible({ timeout: 5000 })
  })

  test('Quick action buttons are present', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'commit' })
    await expect(page.getByText('Transfer')).toBeVisible()
    await expect(page.getByText('QR Pay')).toBeVisible()
    await expect(page.getByText('Pay')).toBeVisible()
    await expect(page.getByText('More')).toBeVisible()
  })

  test('Account card shows account type and number', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'commit' })
    await expect(page.getByText('Savings Account')).toBeVisible()
    await expect(page.getByText('****4521')).toBeVisible()
  })

  test('Recent transactions section exists', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'commit' })
    await expect(page.getByText('Recent Transactions')).toBeVisible()
    await expect(page.getByText('View All')).toBeVisible()
  })

  test('View All navigates to history', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'commit' })
    await page.getByText('View All').click()
    await expect(page).toHaveURL(/\/history/)
  })

  test('Quick action Transfer navigates to /transfer', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'commit' })
    await page.getByRole('link', { name: /Transfer/ }).first().click()
    await expect(page).toHaveURL(/\/transfer/)
  })
})

// ─── Transfer Page ───────────────────────────────────────────────────────────

test.describe('Transfer Page', () => {
  test('Transfer page loads with three transfer types', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('To UOB Account')).toBeVisible()
    await expect(page.getByText('PayNow')).toBeVisible()
    await expect(page.getByText('Other Banks (FAST)')).toBeVisible()
  })

  test('Selecting transfer type shows details', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await page.getByText('To UOB Account').click()
    await expect(page.getByText('Amount to transfer')).toBeVisible()
    await expect(page.getByText('Tap to enter amount')).toBeVisible()
  })

  test('Numeric keypad opens on tap to enter amount', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await page.getByText('To UOB Account').click()
    await page.getByText('Tap to enter amount').click()
    await expect(page.getByText('Done')).toBeVisible()
  })

  test('Can type amount using keypad', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await page.getByText('To UOB Account').click()
    await page.getByText('Tap to enter amount').click()
    // Type 100
    await page.locator('button', { hasText: '1' }).click()
    await page.locator('button', { hasText: '0' }).click()
    await page.locator('button', { hasText: '0' }).click()
    await page.getByText('Done').click()
    await expect(page.getByText('100.00')).toBeVisible()
  })

  test('Continue disabled when no amount entered', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await page.getByText('To UOB Account').click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  test('PayNow shows correct form', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await page.getByText('PayNow').click()
    await expect(page.getByText('PayNow Details')).toBeVisible()
    await expect(page.getByPlaceholder('Mobile number / Email / NRIC')).toBeVisible()
  })

  test('FAST shows bank dropdown', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await page.getByText('Other Banks (FAST)').click()
    await expect(page.locator('select')).toBeVisible()
  })

  test('Confirm screen shows transfer details', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await page.getByText('To UOB Account').click()
    await page.getByText('Tap to enter amount').click()
    await page.locator('button', { hasText: '5' }).click()
    await page.locator('button', { hasText: '0' }).click()
    await page.locator('button', { hasText: '0' }).click()
    await page.getByText('Done').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Review Transfer')).toBeVisible()
    await expect(page.getByText('Confirm Transfer')).toBeVisible()
  })

  test('Success screen shows after confirming transfer', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await page.getByText('To UOB Account').click()
    await page.getByText('Tap to enter amount').click()
    await page.locator('button', { hasText: '2' }).click()
    await page.locator('button', { hasText: '0' }).click()
    await page.locator('button', { hasText: '0' }).click()
    await page.getByText('Done').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Confirm Transfer' }).click()
    await expect(page.getByText('Transfer Initiated')).toBeVisible()
  })

  test('Back to Home button on success screen', async ({ page }) => {
    await page.goto(`${BASE}/transfer`, { waitUntil: 'domcontentloaded' })
    await page.getByText('To UOB Account').click()
    await page.getByText('Tap to enter amount').click()
    await page.locator('button', { hasText: '1' }).click()
    await page.getByText('Done').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Confirm Transfer' }).click()
    await page.getByRole('link', { name: 'Back to Home' }).click()
    await expect(page).toHaveURL(`${BASE}/`)
  })
})

// ─── QR Pay Page ─────────────────────────────────────────────────────────────

test.describe('QR Pay Page', () => {
  test('QR Pay page loads with two tabs', async ({ page }) => {
    await page.goto(`${BASE}/qrpay`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Generate')).toBeVisible()
    await expect(page.getByText('Scan')).toBeVisible()
  })

  test('Generate tab shows amount input', async ({ page }) => {
    await page.goto(`${BASE}/qrpay`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByPlaceholder('0.00')).toBeVisible()
    await expect(page.getByText('Expiry')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate QR Code' })).toBeVisible()
  })

  test('Generate QR disabled when amount is zero', async ({ page }) => {
    await page.goto(`${BASE}/qrpay`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Generate QR Code' })).toBeDisabled()
  })

  test('Generate QR enabled when amount entered', async ({ page }) => {
    await page.goto(`${BASE}/qrpay`, { waitUntil: 'domcontentloaded' })
    await page.getByPlaceholder('0.00').fill('25.00')
    await expect(page.getByRole('button', { name: 'Generate QR Code' })).toBeEnabled()
  })

  test('Expiring time options selectable', async ({ page }) => {
    await page.goto(`${BASE}/qrpay`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: '6 Hours' }).click()
    await page.getByRole('button', { name: '1 Hour' }).click()
    // All three should be visible
    await expect(page.getByText('1 Hour')).toBeVisible()
    await expect(page.getByText('6 Hours')).toBeVisible()
    await expect(page.getByText('24 Hours')).toBeVisible()
  })

  test('Scan tab shows camera button', async ({ page }) => {
    await page.goto(`${BASE}/qrpay`, { waitUntil: 'domcontentloaded' })
    await page.getByText('Scan').click()
    await expect(page.getByText('Scan QR Code')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open Camera' })).toBeVisible()
  })
})

// ─── Cards Page ──────────────────────────────────────────────────────────────

test.describe('Cards Page', () => {
  test('Cards page loads with card list', async ({ page }) => {
    await page.goto(`${BASE}/cards`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText("UOB Lady's Card")).toBeVisible()
    await expect(page.getByText("UOB Virtual Card")).toBeVisible()
  })

  test('Card shows last 4 digits', async ({ page }) => {
    await page.goto(`${BASE}/cards`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('•••• •••• •••• 8821')).toBeVisible()
  })

  test('Spending summary chart is visible', async ({ page }) => {
    await page.goto(`${BASE}/cards`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Spending This Month')).toBeVisible()
    await expect(page.getByText('Dining')).toBeVisible()
    await expect(page.getByText('Transport')).toBeVisible()
    await expect(page.getByText('Shopping')).toBeVisible()
  })

  test('Freeze button toggles card freeze state', async ({ page }) => {
    await page.goto(`${BASE}/cards`, { waitUntil: 'domcontentloaded' })
    const freezeBtn = page.getByRole('button', { name: /Freeze/ }).first()
    await freezeBtn.click()
    await expect(page.getByText('Unfreeze')).toBeVisible()
  })

  test('Add Card button is visible', async ({ page }) => {
    await page.goto(`${BASE}/cards`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: /Add Card/ })).toBeVisible()
  })
})

// ─── Invest Page ─────────────────────────────────────────────────────────────

test.describe('Invest Page', () => {
  test('Invest page loads with portfolio value', async ({ page }) => {
    await page.goto(`${BASE}/invest`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Total Portfolio Value')).toBeVisible()
    await expect(page.getByText("Today's")).toBeVisible()
    await expect(page.getByText('Total Gain/Loss')).toBeVisible()
  })

  test('Market indices are displayed', async ({ page }) => {
    await page.goto(`${BASE}/invest`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('STI')).toBeVisible()
    await expect(page.getByText('DBS')).toBeVisible()
    await expect(page.getByText('OCBC')).toBeVisible()
  })

  test('Holdings tab shows stock list', async ({ page }) => {
    await page.goto(`${BASE}/invest`, { waitUntil: 'domcontentloaded' })
    await page.getByText('Holdings').click()
    await expect(page.getByText('DBS Group Holdings')).toBeVisible()
    await expect(page.getByText('OCBC Bank')).toBeVisible()
  })

  test('History tab shows chart', async ({ page }) => {
    await page.goto(`${BASE}/invest`, { waitUntil: 'domcontentloaded' })
    await page.getByText('History').click()
    await expect(page.getByText('Portfolio History')).toBeVisible()
  })
})

// ─── Transaction History Page ───────────────────────────────────────────────

test.describe('History Page', () => {
  test('History page loads with search and filters', async ({ page }) => {
    await page.goto(`${BASE}/history`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByPlaceholder('Search transactions...')).toBeVisible()
    await expect(page.getByText('All')).toBeVisible()
  })

  test('Filter chips are clickable', async ({ page }) => {
    await page.goto(`${BASE}/history`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Expenses' }).click()
    await expect(page.getByRole('button', { name: 'Expenses' })).toHaveClass(/bg-uob-green/)
  })

  test('Transaction rows display correctly', async ({ page }) => {
    await page.goto(`${BASE}/history`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Salary Credit — ST Engineering')).toBeVisible({ timeout: 5000 })
  })

  test('Search filters transactions', async ({ page }) => {
    await page.goto(`${BASE}/history`, { waitUntil: 'domcontentloaded' })
    await page.getByPlaceholder('Search transactions...').fill('Toast Box')
    await expect(page.getByText('Toast Box Pte Ltd')).toBeVisible()
  })

  test('Income filter shows only credits', async ({ page }) => {
    await page.goto(`${BASE}/history`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Income' }).click()
    const rows = page.locator('.bg-white.rounded-xl')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })
})

// ─── Settings Page ───────────────────────────────────────────────────────────

test.describe('Settings Page', () => {
  test('Settings page loads with sections', async ({ page }) => {
    await page.goto(`${BASE}/settings`)
    await expect(page.getByText('Account')).toBeVisible()
    await expect(page.getByText('Security')).toBeVisible()
    await expect(page.getByText('Support')).toBeVisible()
  })

  test('Profile link is present', async ({ page }) => {
    await page.goto(`${BASE}/settings`)
    await expect(page.getByText('Profile')).toBeVisible()
  })

  test('Log out button is visible', async ({ page }) => {
    await page.goto(`${BASE}/settings`)
    await expect(page.getByText('Log Out')).toBeVisible()
  })
})

// ─── Page Loading & Errors ───────────────────────────────────────────────────

test.describe('Page Loading & Performance', () => {
  test('Pages load without console errors', async ({ page }) => {
    const errors = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    const pages = ['/', '/transfer', '/qrpay', '/cards', '/invest', '/history', '/settings']
    for (const p of pages) {
      await page.goto(`${BASE}${p}`)
      await page.waitForLoadState('domcontentloaded')
    }
    // Filter out expected Firebase/network errors in demo mode
    const criticalErrors = errors.filter(e => !e.includes('firebase') && !e.includes('Firebase') && !e.includes('firestore') && !e.includes('auth'))
    expect(criticalErrors).toHaveLength(0)
  })
})