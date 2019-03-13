const selector = 'MethodDefinition[key.name="constructor"] ThisExpression';

const classListMutationMethods = new Set([
    'add',
    'remove',
    'toggle',
    'replace',
]);

const message =
    'A newly-instantiated element should not sprout any attributes. You should probably move this operation to the connectedCallback().';

function visitor(context, node) {
    const property = node.parent.property;
    if (property) {
        const name = property.name;
        if (name === 'classList') {
            const classListMethod = node.parent.parent.property;
            if (classListMutationMethods.has(classListMethod.name)) {
                context.report({
                    message,
                    node: node.parent.parent,
                });
            }
        } else if (name === 'setAttribute') {
            context.report({
                message,
                node: node.parent.parent,
            });
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
