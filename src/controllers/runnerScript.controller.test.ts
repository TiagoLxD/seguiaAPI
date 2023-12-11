import { describe, expect, it } from "vitest";
import { runJavaScriptTests } from "@/controllers/runnerScript.controller";

describe("runJavaScriptTests", () => {
	it("should run JavaScript tests and return results", async () => {
		const code = `
            function sum(a, b) {
                return a + b;
            }
        `;
		const testCases = [
			{ id: 1, input: [2, 3], expectedOutput: 5 },
			{ id: 2, input: [5, 7], expectedOutput: 12 },
			{ id: 3, input: [10, -3], expectedOutput: 7 },
		];

		const results = await runJavaScriptTests(code, testCases);

		expect(results).toHaveLength(3);

		expect(results[0]).toEqual({
			id: 1,
			input: [2, 3],
			expectedOutput: 5,
			output: "5\n",
			isCorrect: true,
		});

		expect(results[1]).toEqual({
			id: 2,
			input: [5, 7],
			expectedOutput: 12,
			output: "12\n",
			isCorrect: true,
		});

		expect(results[2]).toEqual({
			id: 3,
			input: [10, -3],
			expectedOutput: 7,
			output: "7\n",
			isCorrect: true,
		});
	});

	it("should handle errors in test cases", async () => {
		const code = `
            function divide(a, b) {
                if (b === 0) {
                    throw new Error("Cannot divide by zero");
                }
                return a / b;
            }
        `;
		const testCases = [
			{ id: 1, input: [10, 2], expectedOutput: 5 },
			{ id: 2, input: [8, 0], expectedOutput: null },
		];

		const results = await runJavaScriptTests(code, testCases);

		expect(results).toHaveLength(2);

		expect(results[0]).toEqual({
			id: 1,
			input: [10, 2],
			expectedOutput: 5,
			output: "5\n",
			isCorrect: true,
		});

		expect(results[1]).toEqual({
			id: 2,
			input: [8, 0],
			expectedOutput: null,
			output: "",
			isCorrect: false,
		});
	});
});
