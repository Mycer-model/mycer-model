// Maps tokens.css custom properties into Tailwind so components use bg-surface text-muted, never raw hex.
const c = (n) => `var(--color-${n})`;
module.exports = {
  theme: {
    colors: {
      transparent: 'transparent', current: 'currentColor',
      bg: c('bg'), surface: c('surface'), raised: c('surface-raised'),
      border: c('border'), input: c('border-input'),
      text: c('text'), muted: c('text-muted'),
      accent: c('accent'), 'on-accent': c('on-accent'),
      danger: c('danger'), success: c('success'), warning: c('warning'),
      media: c('media-bg'), 'on-media': c('on-media'),
    },
    fontFamily: { sans: 'var(--font-sans)', mono: 'var(--font-mono)' },
    fontSize: {
      xs: ['12px', '16px'], sm: ['14px', '20px'], base: ['16px', '24px'],
      lg: ['20px', '28px'], xl: ['28px', '34px'], display: ['40px', '44px'],
    },
    borderRadius: { sm: '6px', md: '10px', lg: '16px', pill: '999px' },
    boxShadow: { card: 'var(--shadow-card)', pop: 'var(--shadow-pop)' },
    extend: { spacing: { sidebar: '240px', header: '56px' }, maxWidth: { content: '1280px' } },
  },
};
