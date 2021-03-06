module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/standard'],
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': 0,
    'no-unused-vars': 'off',
    'vue/no-unused-vars': 'off',
    'object-curly-spacing': [0, 'never'] //大括号内是否允许不必要的空格
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
