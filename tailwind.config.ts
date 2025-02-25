import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'scroll': 'scroll 1s ease-in-out infinite',
        'wiggle': 'wiggle 2.5s ease-in-out infinite',
        'right-arrow': 'right-arrow 2.5s ease-in-out infinite',
        'left-arrow': 'left-arrow 2.5s ease-in-out infinite',
      },
      keyframes: {
        'scroll': {
          '0%': { transform: 'translateY(-100%)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'wiggle': {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(30deg)" },
          "50%": { transform: "rotate(0deg)" },
          "75%": { transform: "rotate(-30deg)" },
        },
        'right-arrow': {
          "0%, 24%": { transform: "translateX(0)" }, // 保持不动
          "25%": { transform: "translateX(10px)" }, // 手指向右时，箭头右移
          "50%": { transform: "translateX(0)" }, // 回到原位
          "100%": { transform: "translateX(0)" }, // 保持不动
        },
        'left-arrow': {
          "0%, 74%": { transform: "translateX(0)" }, // 保持不动
          "75%": { transform: "translateX(-10px)" }, // 手指向左时，箭头左移
          "100%": { transform: "translateX(0)" }, // 回到原位
        },
      } 
    },
  },
  plugins: [],
};
export default config;
