/**
 * Performs a basic arithmetic operation on two numbers.
 *
 * This function applies the operator ("+", "-", "*", or "/") to the given operands and
 * returns the computed result.
 *
 * @param firstNumber - The first operand.
 * @param secondNumber - The second operand.
 * @param operator - The arithmetic operator to use; valid values are "+", "-", "*", or "/".
 * @returns The result of performing the arithmetic operation.
 */
function solve(firstNumber: number, secondNumber: number, operator: string): number {
    const operations: { [index: string]: Function } = {
        "+": () => firstNumber + secondNumber,
        "-": () => firstNumber - secondNumber,
        "*": () => firstNumber * secondNumber,
        "/": () => firstNumber / secondNumber
    };

    return operations[operator]();
}


/**
 * Evaluates a simple sub-expression using the two most recent numeric operands and the last operator.
 *
 * This function removes the last two elements from the output array, converts them to numbers, retrieves the last operator from the operators array, and calculates the result using the `solve` function. The computed result is pushed back onto the output array as a string.
 *
 * @param output - An array of strings representing numeric operands, with the last two entries serving as operands.
 * @param operators - An array of strings representing operators, where the last entry is used for the calculation.
 *
 * @throws {string} "Operation Not Supported." if no operator is available.
 */
function solveSimplifiedExpr(output: Array<string>, operators: Array<string>): void {
    const secondNumber = Number(output.pop());
    const firstNumber = Number(output.pop());

    const operator = operators.pop();

    if (operator == null)
        throw "Operation Not Supported.";


    output.push(solve(firstNumber, secondNumber, operator).toString());
}

/**
 * Checks if the provided character is a digit (0-9).
 *
 * @param character The character to evaluate.
 * @returns True if the character is a digit, false otherwise.
 */
function isDigit(character: string) {
    return character.charCodeAt(0) >= "0".charCodeAt(0)
        && character.charCodeAt(0) <= "9".charCodeAt(0);
}


/**
 * Parses a mathematical expression string into an array of tokens.
 *
 * The function tokenizes the expression by removing all spaces and then separating numbers,
 * decimal points, arithmetic operators, and parentheses. It supports negative numbers
 * and validates proper decimal formatting, operator positioning, and balanced parentheses.
 * If the expression is malformed, it throws an error with a descriptive message.
 *
 * @param expression - The mathematical expression to parse.
 * @returns An array of tokens representing numbers, operators, and parentheses.
 *
 * @throws {string} When a decimal number is malformed, an operator is misplaced,
 *                  a parenthesis is unmatched, or an invalid character is encountered.
 */
function parseExpression(expression: string) {
    const operators: Array<string> = ["+", "-", "*", "/"];
    const expr: Array<string> = [];
    const parenthesesStack: Array<string> = [];

    let lastToken: string | null = null;
    let number = "";
    let hasDecimal = false;

    for (const token of expression.replaceAll(" ", "")) {
        if (isDigit(token)) {
            number += token;
        } else if (token === ".") {
            if (hasDecimal || !number.length)
                throw "Número decimal mal formado.";
            number += token;
            hasDecimal = true;
        } else if (token === "(") {
            parenthesesStack.push(token);
            expr.push(token);
            hasDecimal = false;
        } else if (token === ")") {
            if (!parenthesesStack.length)
                throw "Parêntese fechado sem abertura correspondente.";
            parenthesesStack.pop();

            if (number.length) {
                expr.push(number);
                number = "";
                hasDecimal = false;
            }

            expr.push(token);
        } else if (operators.indexOf(token) >= 0) {
            if (!number.length
                && token === "-"
                && (lastToken == null
                    || operators.indexOf(lastToken) >= 0
                    || lastToken == "(")) {
                number += token;
            } else {
                if (!number.length)
                    throw `Operador '${token}' mal posicionado na expressão.`;
                expr.push(number);
                number = "";
                hasDecimal = false;
                expr.push(token);
            }
        } else throw `Caractere inválido na expressão: '${token}'`;

        lastToken = token;
    }

    if (!number.length && (
        lastToken == null
        || operators.indexOf(lastToken) >= 0))
        throw `Operador '${lastToken}' mal posicionado na expressão.`;

    if (parenthesesStack.length)
        throw "Parêntese aberto sem fechamento correspondente.";

    if (number.length)
        expr.push(number);

    return expr;
}

/**
 * Evaluates a mathematical expression string and returns its numerical result.
 *
 * The function tokenizes the input using `parseExpression` and then evaluates the expression 
 * using a stack-based algorithm that respects operator precedence and handles parentheses.
 * Intermediate results are computed by repeatedly applying operations via `solveSimplifiedExpr`.
 *
 * @param expression - The mathematical expression to evaluate.
 * @returns The numerical result of the evaluated expression.
 *
 * @throws Error if the expression is malformed, such as having unmatched parentheses or invalid tokens.
 */
function solveExpression(expression: string) {
    const priorities: { [index: string]: number } = {
        "+": 1,
        "-": 1,
        "*": 2,
        "/": 2
    };

    const operators: Array<string> = [];
    const output: Array<string> = [];

    for (const token of parseExpression(expression)) {
        if (token === "(") {
            operators.push(token);
        } else if (token === ")") {
            while (operators[operators.length - 1] !== "(")
                solveSimplifiedExpr(output, operators);
            operators.pop();
        } else if (priorities.hasOwnProperty(token)) {
            while (operators.length
                && operators[operators.length - 1] != "("
                && priorities[operators[operators.length - 1]] >= priorities[token])
                solveSimplifiedExpr(output, operators);
            operators.push(token);
        } else {
            output.push(token);
        }
    }

    while (operators.length)
        solveSimplifiedExpr(output, operators);

    return Number(output.pop());
}
