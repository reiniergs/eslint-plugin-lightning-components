const selector =
    'NewExpression[callee.name="CustomEvent"][arguments.length>=2]';

function visitor(context, node) {
    const eventConfig = node.arguments[1];
    const properties = eventConfig.properties || [];
    if (properties.length === 0 && eventConfig.type === 'ObjectExpression') {
        context.report({
            fix: fixer => {
                return fixer.removeRange([
                    node.arguments[0].end,
                    node.arguments[1].end,
                ]);
            },
            loc: eventConfig.loc,
            message: 'Avoid configuring the CustomEvent with an empty object.',
        });
    } else {
        properties.forEach(prop => {
            if (prop.value.value === false) {
                context.report({
                    data: { name: prop.key.name },
                    fix: fixer => {
                        return fixer.removeRange([
                            prop.start,
                            // 1 (comma) + 1 (newline) => 2
                            prop.end + 2,
                        ]);
                    },
                    message:
                        'Avoid setting the value of {{name}} to false since that is the default value.',
                    loc: prop.value.loc,
                });
            }
        });
    }
}

module.exports = {
    meta: {
        fixable: 'code',
    },
    create(context) {
        return {
            [selector]: visitor.bind(null, context),
        };
    },
};
