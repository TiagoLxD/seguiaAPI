import { exec } from "child_process";
import { Request, Response } from "express";
import { NodeVM } from "vm2";

class RunnerScript {
	async run(req: Request, res: Response) {
		const { language, code } = req.body;

		switch (language) {
			case "javascript":
				try {
					const vm = new NodeVM({
						timeout: 2000,
						console: "redirect",
					});
					let output = "";
					vm.on("console.log", (data) => {
						output += data + "\n";
					});

					vm.run(code);
					return res.send(output);
				} catch (err) {
					return res.status(500).json({
						error: err.message,
						stack: err.stack,
					});
				}
				break;

			case "python":
				exec(`python -c "${code}"`, (error, stdout, stderr) => {
					if (error) {
						return res.status(500).send(stderr);
					}
					res.send(stdout);
				});
				break;

			default:
				res.status(400).send("Linguagem não suportada.");
		}
	}
}

export default new RunnerScript();
