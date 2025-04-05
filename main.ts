type Operation = {
    priority: number,
    solve: (first: number, second: number) => number
};

interface ExpressionParserInterface {
    parse(expression: string): Array<string>
}

class ExpressionParser implements ExpressionParserInterface {
    #operators: Set<string> = new Set(["+", "-", "*", "/"]);

    #parenthesesStack: Array<string>;
    #expression: Array<string>;

    #lastToken: string | null;
    #hasDecimal: boolean;
    #number: string;

    #isDigit(token: string) {
        return token.charCodeAt(0) >= "0".charCodeAt(0)
            && token.charCodeAt(0) <= "9".charCodeAt(0);
    }

    #isNegativeSignal(token: string) {
        return !this.#isValidNumber()
            && token === "-"
            && (this.#lastToken == null
                || this.#lastToken == "("
                || this.#isOperator(this.#lastToken));
    }

    #isOperator(token: string) {
        return this.#operators.has(token);
    }

    #isValidNumber() {
        return this.#number.length > 0;
    }

    #addNumberToExpression() {
        this.#expression.push(this.#number);
        this.#hasDecimal = false;
        this.#number = "";
    }

    #addDecimalPoint() {
        if (this.#hasDecimal || !this.#isValidNumber())
            throw "Número decimal mal formado.";

        this.#hasDecimal = true;
        this.#number += ".";
    }

    #openParentheses() {
        this.#parenthesesStack.push("(");
        this.#expression.push("(");
        this.#hasDecimal = false;
    }

    #closeParentheses() {
        if (!this.#parenthesesStack.length)
            throw "Parêntese fechado sem abertura correspondente.";
        this.#parenthesesStack.pop();

        if (this.#isValidNumber())
            this.#addNumberToExpression();

        this.#expression.push(")");
    }

    #handleOperator(operator: string) {
        if (this.#isNegativeSignal(operator)) {
            this.#number += operator;
        } else {
            if (!this.#isValidNumber())
                throw `Operador '${operator}' mal posicionado na expressão.`;
            this.#addNumberToExpression();
            this.#expression.push(operator);
        }
    }

    parse(expression: string): Array<string> {
        this.#parenthesesStack = [];
        this.#expression = [];

        this.#hasDecimal = false;
        this.#lastToken = null;
        this.#number = "";

        for (const token of expression.replaceAll(" ", "")) {
            if (this.#isDigit(token)) {
                this.#number += token;
            } else if (token === ".") {
                this.#addDecimalPoint();
            } else if (token === "(") {
                this.#openParentheses();
            } else if (token === ")") {
                this.#closeParentheses();
            } else if (this.#isOperator(token)) {
                this.#handleOperator(token);
            } else throw `Caractere inválido na expressão: '${token}'`;

            this.#lastToken = token;
        }

        if (!this.#isValidNumber() && (
            this.#lastToken == null
            || this.#isOperator(this.#lastToken)))
            throw `Operador '${this.#lastToken}' mal posicionado na expressão.`;

        if (this.#isValidNumber())
            this.#addNumberToExpression();

        if (this.#parenthesesStack.length)
            throw "Parêntese aberto sem fechamento correspondente.";


        return this.#expression;
    }
}

class ExpressionSolver {
    #operations: { [index: string]: Operation } = {
        "+": { priority: 1, solve: (first: number, second: number) => first + second },
        "-": { priority: 1, solve: (first: number, second: number) => first - second },
        "*": { priority: 2, solve: (first: number, second: number) => first * second },
        "/": { priority: 2, solve: (first: number, second: number) => first / second }
    };
    #parser: ExpressionParserInterface;
    #operators: Array<string>;
    #output: Array<string>;

    constructor(expressionParse: ExpressionParserInterface) {
        this.#parser = expressionParse;
    }

    #solve() {
        const secondNumber = Number(this.#output.pop());
        const firstNumber = Number(this.#output.pop());
        const operator = this.#operators.pop();

        if (operator == null || !this.#operations.hasOwnProperty(operator))
            throw "Operation Not Supported.";

        const result = this.#operations[operator].solve(firstNumber, secondNumber);
        this.#output.push(result.toString());
    }

    #lastOperator() {
        return this.#operators[this.#operators.length - 1];
    }

    #isOperator(token: string) {
        return this.#operations.hasOwnProperty(token);
    }


    solve(expression: string): number {
        this.#operators = [];
        this.#output = [];

        for (const token of this.#parser.parse(expression)) {
            if (token === "(") {
                this.#operators.push(token);
            } else if (token === ")") {
                while (this.#lastOperator() !== "(")
                    this.#solve();
                this.#operators.pop();
            } else if (this.#isOperator(token)) {
                while (this.#operators.length
                    && this.#lastOperator() != "("
                    && this.#operations[this.#lastOperator()].priority >= this.#operations[token].priority)
                    this.#solve();
                this.#operators.push(token);
            } else {
                this.#output.push(token);
            }
        }

        while (this.#operators.length)
            this.#solve();

        return Number(this.#output.pop());
    }
}


const handler = new ExpressionParser();
const solver = new ExpressionSolver(handler);

// console.log(solver.solve("1 + 2 * 3"))
console.log(solver.solve("1 + 2 * 3"))
