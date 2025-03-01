import localFont from "next/font/local";

const opinionPro = localFont({
    src: '../public/fonts/OpinionProExtraCondensed-Regular.otf',
    display: 'swap',
    variable: '--font-opinionpro', // Optional: Define a CSS variable
});

export {
    opinionPro
}