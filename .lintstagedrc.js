module.exports = {
  '**/*.{ts,tsx}': (filenames) => [
    'yarn type-check',
    `yarn eslint ${filenames.join(' ')}`,
    `yarn prettier --write ${filenames.join(' ')}`,
  ],

  '**/*.{js,jsx}': (filenames) => [
    `yarn eslint ${filenames.join(' ')}`,
    `yarn prettier --write ${filenames.join(' ')}`,
  ],

  '**/*.{json,css,scss,md,yml,yaml}': (filenames) => [
    `yarn prettier --write ${filenames.join(' ')}`,
  ],
};
