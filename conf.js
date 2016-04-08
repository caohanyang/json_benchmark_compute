exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  allScriptsTimeout: 3600000,
  jasmineNodeOpts: {defaultTimeoutInterval: 3600000},
  specs: ['todo-spec.js']
  // capabilities: {
  //   browserName: 'firefox'
  // }
};
