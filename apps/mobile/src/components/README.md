# Product composition boundary

Only product-level compositions belong here. Do not copy or redefine Com Design Core components; consume Core contracts/tokens from the repository source of truth.

## Carousel

`Carousel.tsx` is the mobile product carousel composition. It supports two sizes:

- `sm`: 120px, for compact recommendation and notice banners.
- `lg`: 176px (default), for primary campaign and competition banners.

It accepts local React content through `items`, supports native swipe/scroll snap, previous/next controls, indicators, keyboard arrows, optional autoplay, and reduced-motion preferences.

```tsx
<Carousel
  size="lg"
  ariaLabel="推荐赛事"
  items={banners.map(banner => ({
    id: banner.id,
    ariaLabel: banner.title,
    content: <a href={banner.href}>{banner.title}</a>,
  }))}
/>
```

## MobileFilter

`MobileFilter.tsx` is a controlled mobile list filter. A keyword input sits next to a filter trigger button that shows an active-condition badge. Committing a keyword (Enter or the trigger) turns it into a removable tag, and the trigger opens the shared `Dialog` bottom sheet where grouped single-select conditions are applied with 重置 / 确定. Active conditions backfill into the filter bar as removable tags. The parent remains the only source of filter state; the component only keeps pending input and dialog draft locally.
