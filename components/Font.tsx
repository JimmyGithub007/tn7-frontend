import localFont from "next/font/local";

const opinionPro = localFont({
    src: '../public/fonts/OpinionProExtraCondensed-Regular.otf',
    display: 'swap',
    variable: '--font-opinionpro', // Optional: Define a CSS variable
});


const impact = localFont({
  src: [
    { path: '../public/fonts/impact.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Impacted.ttf', weight: '700', style: 'normal' },
    { path: '../public/fonts/unicode.impact.ttf', weight: '400', style: 'italic' }
  ],
  variable: '--font-impact'
});

export {
    opinionPro,
    impact
}