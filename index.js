

const RULE_NAMES = [
    'check-return-value-for-nullable-call',
    'no-added-attributes-in-constructor',
    'no-custom-event-bubbling',
    'no-custom-event-default-config',
    'no-custom-event-identifier-arguments',
]

const plugin = { 
    recommended: {
        rules: {},
    },
    rules: {},
};    

module.exports = RULE_NAMES.reduce((seed, ruleName) => {
    seed.recommended.rules[`lightning-components/${ruleName}`] = 'error';
    seed.rules[ruleName] = require(`./rules/${ruleName}`);
    return seed;
}, plugin); 

