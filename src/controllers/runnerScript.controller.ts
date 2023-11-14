import { Request, Response } from "express";
import { NodeVM } from "vm2";
import Benchmark from "benchmark";

import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

function parseInput(input) {
	const tokens = input
		.split(/\s+/) // Divide por espaços e/ou quebras de linha
		.map((token) => token.trim())
		.filter((token) => token !== ""); // Remove tokens vazios

	return tokens;
}

async function runJavaScriptTests(code, testCases) {
	const vm = new NodeVM({
		timeout: 2000,
		console: "redirect",
	});
	const results = [];

	await Promise.all(
		testCases.map(async (testCase) => {
			const { id, input, expectedOutput } = testCase;
			const inputTokens = parseInput(input);
			let output = "";
			let isCorrect = false;

			vm.on("console.log", (data) => {
				output += data + "\n";
			});

			try {
				const codeWithGets = `
                    const gets = () => {
                       return ${JSON.stringify(inputTokens.shift() || "")};
                    };
                    ${code}
                `;

				await vm.run(codeWithGets);
				isCorrect = output.trim() === expectedOutput.trim();
			} catch (err) {
				console.error(`Error in test case ${id}:`, err.message);
			}

			results.push({
				id,
				input,
				expectedOutput,
				output,
				isCorrect,
			});
		})
	);

	return results;
}

async function runBenchmark(fn: any) {
	return new Promise((resolve) => {
		const suite = new Benchmark.Suite();

		suite.add("Code Execution", async () => {
			await fn();
		});

		suite.on("complete", function () {
			const results = this.map((test) => ({
				name: test.name,
				hz: test.hz,
				stats: {
					meanMs: (1 / test.hz) * 1000,
					totalOps: test.count,
					rme: test.stats.rme,
				},
			}));

			const fastestTest = this.filter("fastest")[0];
			const fastestOpsPerSec = fastestTest.hz.toLocaleString("en", {
				maximumFractionDigits: 3,
			});

			const resultString = `${fastestOpsPerSec} ops/s ± ${fastestTest.stats.rme.toFixed(
				2
			)}% Fastest`;

			resolve({
				benchmark: resultString,
			});
		});

		suite.run({ async: true });
	});
}
// const benchmarkResults = await runBenchmark(() => {
// 	const vm = new NodeVM({
// 		timeout: 2000,
// 		console: "redirect",
// 	});
// 	let output = "";

// 	vm.on("console.log", (data) => {
// 		output += data + "\n";
// 	});

// 	vm.run(code);

// 	return { output };
// });

// return res.status(200).json(benchmarkResults);

class RunnerScript {
	async run(req: Request, res: Response) {
		const { language, code, testCases } = req.body;

		switch (language) {
			case "javascript":
				try {
					const results = await runJavaScriptTests(code, testCases);
					return res.status(200).json(results);
				} catch (err) {
					return res.status(500).json({
						error: err.message,
						stack: err.stack,
					});
				}
			case "python":
				try {
					const { stdout, stderr } = await execAsync(`python -c "${code}"`);
					if (stderr) {
						return res.status(500).send(stderr);
					}
					return res.status(200).json({ output: stdout });
				} catch (error) {
					return res.status(500).json({
						error: error.message,
						stack: error.stack,
					});
				}
				break;

			default:
				return res.status(400).send("Linguagem não suportada.");
		}
	}
}

export default new RunnerScript();
