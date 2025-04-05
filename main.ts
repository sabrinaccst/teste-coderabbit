function solve(firstNumber: number, secondNumber: number, operator: string): number {
    const operations: { [index: string]: Function } = {
        "+": () => firstNumber + secondNumber,
        "-": () => firstNumber - secondNumber,
        "*": () => firstNumber * secondNumber,
        "/": () => firstNumber / secondNumber
    };

    return operations[operator]();
}


function solveSimplifiedExpr(output: Array<string>, operators: Array<string>): void {
    const secondNumber = Number(output.pop());
    const firstNumber = Number(output.pop());

    const operator = operators.pop();

    if (operator == null)
        throw "Operation Not Supported.";


    output.push(solve(firstNumber, secondNumber, operator).toString());
}

function isDigit(character: string) {
    return character.charCodeAt(0) >= "0".charCodeAt(0)
        && character.charCodeAt(0) <= "9".charCodeAt(0);
}


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
