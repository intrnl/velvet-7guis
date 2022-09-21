// Adapted from https://github.com/theSherwood/7_GUIs/blob/master/solid/src/tasks/Cells/parse.js

export const sampleData = {
	A0: 'Data',
	A1: '20',
	A2: '15',
	A3: 'text',
	B1: '79',
	B2: '3.9',
	A5: 'Formula',
	B5: 'Output',
	A6: '"=sum(D1:D5)"',
	B6: '=sum(D1:D5)',
	A7: '"=sub(A1:B2)"',
	B7: '=sub(A1:B2)',
	A8: '"=mul(D1:D5)"',
	B8: '=mul(D1:D5)',
	A9: '"=div(A1:B2)"',
	B9: '=div(A1:B2)',
	A10: '"=mod(A1:B2)"',
	B10: '=mod(A1:B2)',
	C0: 'Formula',
	D0: 'Output',
	C1: '"=sum(A1,A2)"',
	D1: '=sum(A1,A2)',
	C2: '"=sub(D1,A1)"',
	D2: '=sub(D1,A1)',
	C3: '"=mul(D2,A2)"',
	D3: '=mul(D2,A2)',
	C4: '"=div(D3,A1)"',
	D4: '=div(D3,A1)',
	C5: '"=mod(A1,A2)"',
	D5: '=mod(A1,A2)',
	C7: '"=sum(A1,A3)"',
	D7: '=sum(A1,A3)',
	C8: '"=sum(A1,A4)"',
	D8: '=sum(A1,A4)',
	C9: '"=sumA1,A4)"',
	D9: '=sumA1,A4)',
	C10: '"=sm(A1,A4)"',
	D10: '=sm(A1,A4)',
	C11: '"=sum(A1,307)"',
	D11: '=sum(A1,307)',
	C12: '"=sum(159,4)"',
	D12: '=sum(159,4)',
	C14: '"=A1"',
	D14: '=A1',
	C15: '"=A3"',
	D15: '=A3',
};

export class Parser {
	constructor (cells, columns, rows) {
		this.cells = cells;
		this.columns = columns;
		this.rows = rows;

		this.operations = {
			__proto__: null,
			sum: (a, b) => a + b,
			sub: (a, b) => a - b,
			mul: (a, b) => a * b,
			div: (a, b) => a / b,
			mod: (a, b) => a % b,
			exp: (a, b) => a ** b,
		};
	}

	updateCells (cells) {
	  this.cells = cells;
	}

	cartesianProduct (letters, numbers) {
		var result = [];

		for (const letter of letters) {
			for (const number of numbers) {
				result.push(letter + number);
			}
		}

		return result;
	}

	findArrRange (arr, start, end) {
		const startI = arr.indexOf(start);
		const endI = arr.indexOf(end);

		if (startI == -1 || endI == -1 || startI > endI) {
			return [];
		}

		return arr.slice(startI, endI + 1);
	}

	getRange (rangeStart, rangeEnd) {
		rangeStart = this.splitOperand(rangeStart);
		rangeEnd = this.splitOperand(rangeEnd);

		const letters = this.findArrRange(this.columns, rangeStart[0], rangeEnd[0]);
		const numbers = this.findArrRange(this.rows, rangeStart[1], rangeEnd[1]);

		return this.cartesianProduct(letters, numbers);
	}

	splitOperand (operand) {
		return [operand.match(/[a-zA-Z]+/)[0], Number(operand.match(/\d+/)[0])];
	}

	rangeOperation (op, rangeStart, rangeEnd) {
		if (!(this.isWellFormed(rangeStart) && this.isWellFormed(rangeEnd))) {
			return this.originalString;
		}

		let range = this.getRange(rangeStart, rangeEnd);

		return range.map((address) => Number(this.parse(this.cells[address]))).reduce(this.operations[op]);
	}

	singleOperation (op, operand1, operand2) {
		let first = this.parseOperand(operand1);
		let second = this.parseOperand(operand2);

		if (first === null || second === null) {
			return this.originalString;
		}

		return this.operations[op](first, second).toString();
	}

	isWellFormed (operand) {
		return /[a-zA-Z]+\d+/.test(operand);
	}

	parseOperand (operand) {
		if (!isNaN(Number(operand))) {
			return Number(operand);
		}

		if (operand in this.cells) {
			return Number(this.parse(this.cells[operand]));
		}

		if (this.isWellFormed(operand)) {
			return 0;
		}

		return null;
	}

	parseOperation (op, formula) {
		if (!(formula.startsWith('(') && formula.endsWith(')'))) {
			return this.originalString;
		}

		formula = formula.slice(1, formula.length - 1);

		let operationType;
		let formulaArr;
		if (formula.includes(',')) {
			operationType = 'single';
			formulaArr = formula.split(',');
		}
		else if (formula.includes(':')) {
			operationType = 'range';
			formulaArr = formula.split(':');
		}

		if (formulaArr.length !== 2) {
			return this.originalString;
		}

		if (operationType === 'single') {
			return this.singleOperation(op, formulaArr[0], formulaArr[1]);
		}

		if (operationType === 'range') {
			return this.rangeOperation(op, formulaArr[0], formulaArr[1]);
		}

		return this.originalString;
	}

	parse (str) {
		if (typeof str !== 'string') {
			return '';
		}

		if (!str.startsWith('=')) {
			return str;
		}

		this.originalString = str;

		const formula = str.slice(1);

		if (formula.slice(0, 3).toLowerCase() in this.operations) {
			return this.parseOperation(formula.slice(0, 3).toLowerCase(), formula.slice(3).toUpperCase());
		}
		else {
			return this.cells[formula] || str;
		}
	}
}
