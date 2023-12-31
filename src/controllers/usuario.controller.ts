import usuarioRepository from "@/repositories/usuario.repository";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { env } from "@/configs/env";
import jwt from "jsonwebtoken";
import { z } from "zod";

const registerSchema = z.object({
	completeName: z.string().min(3, { message: "O Nome completo não pode estar vazio." }),
	email: z.string().email({ message: "O e-mail fornecido não é válido." }),
	password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

class UsuarioController {
	async cadastro(req: Request, res: Response) {
		try {
			const parsedData = registerSchema.safeParse(req.body);
			if (!parsedData.success) {
				return res.status(400).json(parsedData);
			}

			const { completeName, email, password } = req.body;

			if (!email || !password || !completeName) {
				return res.status(400).json({ error: "Todos os campos são obrigatórios." });
			}

			const existingUser = await usuarioRepository.findUser(email);

			if (existingUser) {
				return res.status(400).json({ error: "O usuário já existe." });
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const newUser = {
				completeName,
				email,
				hash: hashedPassword,
			};

			await usuarioRepository.createUser(newUser);

			return res.json({ message: "Usuário criado com sucesso." });
		} catch (error: unknown) {
			return res.status(500).json({ error: (error as Error).message });
		}
	}

	async login(req: Request, res: Response) {
		const { email, password } = req.body;

		try {
			const existingUser = await usuarioRepository.findUser(email);

			if (!existingUser) {
				return res.status(401).json({ error: "Usuário ou senha errado" });
			}

			const passwordMatch = await bcrypt.compare(password, existingUser.password);

			if (!passwordMatch) {
				return res.status(401).json({ error: "Credenciais inválidas." });
			}

			const token = jwt.sign(
				{
					clienteId: existingUser.id,
					cliente: existingUser.completeName,
					email: existingUser.email,
				},
				env.jwtSecret,
				{ expiresIn: "1h" }
			);

			return res.json({ token: token.toString() });
		} catch (error) {
			return res.json({ error: error.message });
		}
	}
}
export type LoginType = {
	token: string;
	error: string;
};

export default new UsuarioController();
