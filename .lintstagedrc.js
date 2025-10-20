module.exports = {
  '**/*.{ts,tsx}': (filenames) => [
    'npm run type-check',
    `npm run lint ${filenames.join(' ')}`,
    `npx prettier --write ${filenames.join(' ')}`,
  ],

  '**/*.{js,jsx}': (filenames) => [
    `npm run lint ${filenames.join(' ')}`,
    `npx prettier --write ${filenames.join(' ')}`,
  ],

  '**/*.{json,css,scss,md,yml,yaml}': (filenames) => [
    `npx prettier --write ${filenames.join(' ')}`,
  ],
};
