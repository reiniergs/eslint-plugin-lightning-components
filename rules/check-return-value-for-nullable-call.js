const FUNC_NAMES = ['getComputedStyle'];

function toMessage(name) {
    return `Should check return value from ${name} which can be null. (https://salesforce.quip.com/JdDUAz5Eqmk7#fGdACAluXf9)`;
}

function isNullableCall(funcName) {
    return funcName && FUNC_NAMES.some(name => name === funcName);
}

function isValidPattern(left, right) {
    if (left.type === 'CallExpression') {
        const args = left.arguments;
        if (left.callee.type === 'Identifier') {
            return (
                isNullableCall(left.callee.name) &&
                right.type === 'MemberExpression' &&
                right.object.name === args[0].name &&
                right.property.name === 'style'
            );
        } else if (left.callee.type === 'MemberExpression') {
            return (
                left.callee.object.name === 'window' &&
                isNullableCall(left.callee.property.name) &&
                right.type === 'MemberExpression' &&
                right.object.name === args[0].name &&
                right.property.name === 'style'
            );
        }
    }
    return false;
}

function predictIfNodeReturnNull(node) {
    if (node.type === 'VariableDeclarator' && node.init) {
        return predictIfNodeReturnNull(node.init);
    } else if (node.type === 'ExpressionStatement' && node.expression) {
        return predictIfNodeReturnNull(node.expression);
    } else if (node.type === 'LogicalExpression') {
        if (node.operator === '||' && isValidPattern(node.left, node.right)) {
            return { canBeNull: false };
        }
        return (
            predictIfNodeReturnNull(node.left) ||
            predictIfNodeReturnNull(node.right)
        );
    } else if (node.type === 'CallExpression') {
        return predictIfNodeReturnNull(node.callee);
    } else if (node.type === 'Property') {
        return predictIfNodeReturnNull(node.value);
    } else if (node.type === 'FunctionExpression') {
        return predictIfNodeReturnNull(node.body);
    } else if (node.type === 'BlockStatement') {
        for (let i = 0; i < node.body.length; i++) {
            const predict = predictIfNodeReturnNull(node.body[i]);
            if (predict.canBeNull) {
                return predict;
            }
        }
    } else if (node.type === 'ObjectExpression') {
        for (let i = 0; i < node.properties.length; i++) {
            const predict = predictIfNodeReturnNull(node.properties[i]);
            if (predict.canBeNull) {
                return predict;
            }
        }
    } else if (node.type === 'MemberExpression') {
        if (
            node.object.type === 'Identifier' &&
            node.object.name === 'window' &&
            isNullableCall(node.property.name)
        ) {
            return {
                canBeNull: true,
                name: node.property.name,
            };
        }
        return predictIfNodeReturnNull(node.object);
    } else if (node.type === 'Identifier') {
        if (isNullableCall(node.name)) {
            return {
                canBeNull: true,
                name: node.name,
            };
        }
    }
    return { canBeNull: false };
}
/*
 * Check below pattern if applied, should change to getComputedStyle(node) || node.style
 */
function visitor(context, node) {
    const predict = predictIfNodeReturnNull(node);
    if (predict.canBeNull) {
        context.report({
            message: toMessage(predict.name),
            node,
        });
    }
}

module.exports = {
    create(context) {
        return {
            VariableDeclarator: visitor.bind(null, context),
            ExpressionStatement: visitor.bind(null, context),
        };
    },
};
