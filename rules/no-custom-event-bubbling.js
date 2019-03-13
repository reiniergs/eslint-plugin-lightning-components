const selector =
    'NewExpression[callee.name="CustomEvent"][arguments.length>=2]';

const nativeBubblingEvents = ['change', 'input', 'select'];

function visitor(context, node) {
    const [name, config] = node.arguments;
    const properties = config.properties || [];

    // We can only verify the case where the event name is a string literal and
    // the config is an object expression. For example, we can't handle the
    // case where either parameter is an identifier:
    // ```
    // const name = 'foo';
    // const config = {};
    // new CustomEvent(name, config);
    // ```
    if (name.type === 'Literal' && config.type === 'ObjectExpression') {
        const eventName = name.value;
        const isPrivateEvent = eventName.startsWith('private');
        const isBubblingEvent = properties.reduce((bubbles, prop) => {
            if (prop.key.name === 'bubbles') {
                bubbles = prop.value.value;
            }
            return bubbles;
        }, false);

        if (!isPrivateEvent && isBubblingEvent) {
            if (!nativeBubblingEvents.includes(eventName)) {
                context.report({
                    message: `Only private events should bubble. Rename the event to "private${eventName}" and stop its propagation after dispatching.`,
                    node,
                });
            }
        }
    }
}

module.exports = {
    create(context) {
        return {
            [selector]: visitor.bind(null, context),
        };
    },
};
