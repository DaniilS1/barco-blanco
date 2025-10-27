# Cart Functionality Test Guide

## Test Scenarios

### 1. Normal Usage (localStorage available)
- [ ] Add items to cart
- [ ] Navigate to order page
- [ ] Verify cart items are displayed
- [ ] Verify order button is enabled
- [ ] Submit order successfully

### 2. Private/Incognito Mode (localStorage blocked)
- [ ] Open browser in private/incognito mode
- [ ] Add items to cart
- [ ] Navigate to order page
- [ ] Verify toast notification appears: "Увага: кошик буде працювати тільки в цій сесії"
- [ ] Verify cart items are still displayed
- [ ] Verify order button is enabled
- [ ] Submit order successfully

### 3. Slow Device/Network
- [ ] Throttle network in DevTools (Slow 3G)
- [ ] Add items to cart
- [ ] Navigate to order page
- [ ] Verify loading skeleton appears
- [ ] Verify cart loads after delay
- [ ] Verify order button becomes enabled

### 4. Browser Console Debug
Check console for these logs:
- [ ] "Cart loaded: { isCartLoaded: true, isLocalStorageAvailable: true/false, cartLength: X }"
- [ ] No localStorage errors in normal mode
- [ ] "localStorage not available" error in private mode

### 5. Edge Cases
- [ ] Refresh page with items in cart (should persist)
- [ ] Close and reopen browser tab (should persist in normal mode)
- [ ] Clear browser data (should reset cart)
- [ ] Disable JavaScript (should show fallback)

## Expected Behavior

### Loading States
- Order button shows "Завантаження..." while cart is loading
- Cart items show skeleton animation while loading
- Button is disabled until cart is fully loaded

### Error Handling
- Toast notification when localStorage is unavailable
- Cart still works in session-only mode
- No crashes or broken UI

### Performance
- Cart loads quickly on normal devices
- No hydration mismatches
- Smooth transitions between states
