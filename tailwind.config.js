export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
      'bg-red-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-gray-500',
      'text-white',
      'text-black',
      'border-black',
    ],
    theme: { extend: {} },
    plugins: [],
  }