# Accessibility & Performance Guidelines

## 📋 Overview

We use Lighthouse CI to enforce quality standards for every build:
- **Performance ≥ 90%** - Fast loading and responsive interactions
- **Accessibility ≥ 90%** - WCAG compliance for all users
- **Best Practices ≥ 90%** - Security and modern web standards
- **SEO ≥ 90%** - Search engine optimization
- **PWA ≥ 80%** - Progressive Web App features (warning threshold)

Failures on **error** thresholds block merges; **warn** thresholds show advisories.

---

## 🔧 Running Locally

1. **Install Lighthouse CI globally:**
   ```bash
   npm install -g @lhci/cli
   ```

2. **Run Lighthouse CI:**
   ```bash
   # Make sure your dev server is running
   npm run dev
   
   # In another terminal, run Lighthouse
   lhci autorun --config=lighthouserc.json
   ```

3. **Or run specific audits:**
   ```bash
   # Just collect results without assertions
   lhci collect --config=lighthouserc.json
   
   # Run assertions on collected results
   lhci assert --config=lighthouserc.json
   ```

---

## 📊 Bundle-Size Analysis

We use `source-map-explorer` to visualize what's in our bundles:

```bash
# Analyze JavaScript bundles
npm run analyze:bundle

# Analyze CSS bundles
npm run analyze:css
```

**Bundle Size Goals:**
- **Initial JS bundle**: < 200 KB gzipped
- **Critical CSS**: < 50 KB gzipped
- **Lazy-loaded chunks**: < 100 KB each

---

## 🛠 Performance Tips

### Code Splitting
```tsx
// Use dynamic imports for heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Wrap in Suspense
<Suspense fallback={<LoadingSkeleton />}>
  <HeavyComponent />
</Suspense>
```

### Bundle Optimization
```bash
# Remove unused CSS classes
npm run build  # Tailwind automatically purges unused classes

# Analyze and identify heavy dependencies
npm run analyze:bundle
```

### Image Optimization
```tsx
// Use proper image formats and lazy loading
<img 
  src="/optimized-image.webp" 
  alt="Descriptive alt text"
  loading="lazy"
  width="300"
  height="200"
/>
```

---

## ♿ Accessibility Best Practices

### ARIA Labels and Roles
```tsx
// Interactive elements need accessible names
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Form inputs need labels
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

### Keyboard Navigation
```tsx
// Ensure all interactive elements are keyboard accessible
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    onClick();
  }
};

<div 
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={onClick}
>
  Custom button
</div>
```

### Focus Management
```tsx
// Manage focus for dynamic content
const dialogRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);
```

### Color Contrast
- Ensure minimum 4.5:1 contrast ratio for normal text
- Use semantic colors from our design system
- Test with color blindness simulators

---

## 🔍 Testing Tools

### ESLint Accessibility Rules
```bash
# Lint for accessibility issues
npm run lint
```

Our ESLint config includes `eslint-plugin-jsx-a11y` to catch common accessibility issues.

### Manual Testing Checklist
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify proper heading hierarchy (h1 → h2 → h3...)
- [ ] Check color contrast in both light and dark modes
- [ ] Test with browser zoom up to 200%

---

## 🚨 Common Issues & Fixes

### Low Accessibility Score
- **Missing alt text**: Add descriptive `alt` attributes to all images
- **Poor color contrast**: Use semantic colors from design system
- **Missing form labels**: Associate every input with a label
- **No focus indicators**: Ensure visible focus states for all interactive elements

### Poor Performance Score
- **Large bundle size**: Use code splitting and lazy loading
- **Unoptimized images**: Use WebP format and proper sizing
- **Blocking resources**: Move non-critical CSS and JS to load asynchronously
- **Missing caching headers**: Configure proper HTTP caching

### SEO Issues
- **Missing meta tags**: Add title, description, and Open Graph tags
- **Poor URL structure**: Use semantic, readable URLs
- **Missing structured data**: Add JSON-LD for rich snippets
- **Slow loading**: Optimize Core Web Vitals

---

## 📈 Continuous Monitoring

Our GitHub Actions automatically run Lighthouse CI on every:
- Push to `main` branch
- Pull request

View results in:
- GitHub Actions logs
- Lighthouse CI temporary storage links
- PR comments with score comparisons

For production monitoring, consider integrating with:
- Google PageSpeed Insights API
- Core Web Vitals monitoring tools
- Real User Monitoring (RUM) services