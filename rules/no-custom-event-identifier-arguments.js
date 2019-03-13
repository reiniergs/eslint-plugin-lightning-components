const selector =
    'NewExpression[callee.name="CustomEvent"][arguments.length>=2]';

function visitor(context, node) {
    const [name, config] = node.arguments;
    if (name.type !== 'Literal' || config.type !== 'ObjectExpression') {
        context.report({
            message:
                'The event name must be a string literal and the event name should be an object expression. (https://salesforce.quip.com/JdDUAz5Eqmk7#fGdACASzxD7)',
            node,
        });
    }
}

module.exports = {
    create(context) {
        return {
            [selector]: visitor.bind(null, context),
        };
    },
};
