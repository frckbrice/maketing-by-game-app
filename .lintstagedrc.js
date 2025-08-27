module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write', 'git add'],
  '*.{json,md,yml,yaml}': ['prettier --write', 'git add'],
  '*.{css,scss,sass}': ['git add'],
};
