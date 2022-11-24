module.exports = {
  extends: [
    /*
    Standard shareable SCSS config for Stylelint. Extends both the
    `stylelint-config-standard` and `stylelint-config-recommended-scss`
    shared config and configures its rules for SCSS.
    https://github.com/stylelint-scss/stylelint-config-standard-scss
    */
    'stylelint-config-standard-scss',
    /*
    Recommended shareable Vue config for Stylelint. Extends the
    `stylelint-config-recommended` shared config and bundles
    the `postcss-html` custom syntax and configures it.
    https://github.com/ota-meshi/stylelint-config-recommended-vue
    */
    'stylelint-config-recommended-vue',
    /*
    Turns off all CSS and SCSS rules that are unnecessary or might
    conflict with Prettier.
    https://github.com/prettier/stylelint-config-prettier-scss
    */
    'stylelint-config-prettier-scss',
    /*
    Styles ordered based on `idiomatic-css`.
    https://github.com/ream88/stylelint-config-idiomatic-order
    https://github.com/necolas/idiomatic-css#declaration-order
    */
    'stylelint-config-idiomatic-order',
  ],
  plugins: [
    /*
    Collection of SCSS specific linting rules for Stylelint.
    https://github.com/stylelint-scss/stylelint-scss
    */
    'stylelint-scss',
    /*
    Plugin pack of order-related linting rules for Stylelint.
    https://github.com/hudochenkov/stylelint-order
    */
    'stylelint-order',
  ],
  rules: {
    'color-hex-length': 'long',
    'color-function-notation': 'legacy',
    'indentation': 2,
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'no-descending-specificity': null,
    'function-no-unknown': [true, {
      'ignoreFunctions': ['span'],
    }],
    'scss/no-global-function-names': null,
    'selector-class-pattern': null,
    'scss/at-function-pattern': null,
    'shorthand-property-no-redundant-values': null,
    'length-zero-no-unit': null,
    'alpha-value-notation': null,
    'font-family-name-quotes': 'always-unless-keyword',
  },
}
