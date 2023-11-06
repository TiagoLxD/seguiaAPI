import usuarioRepository from "@/repositories/usuario.repository";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { env } from "@/configs/env";
import jwt from "jsonwebtoken";
import { z } from "zod";

const UserSchema = z.object({
	firstName: z.string().min(1, { message: "O primeiro nome não pode estar vazio." }),
	lastName: z.string().min(1, { message: "O sobrenome não pode estar vazio." }),
	email: z.string().email({ message: "O e-mail fornecido não é válido." }),
	password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

class UsuarioController {
	async cadastro(req: Request, res: Response) {
		try {
			const parsedData = UserSchema.safeParse(req.body);
			if (!parsedData.success) {
				return res.status(400).json(parsedData.error.format());
			}

			const { firstName, lastName, email, password } = req.body;

			if (!email || !password || !firstName || !lastName) {
				return res.status(400).json({ error: "Todos os campos são obrigatórios." });
			}

			const existingUser = await usuarioRepository.findUser(email);

			if (existingUser) {
				return res.status(400).json({ error: "O usuário já existe." });
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const newUser = {
				firstName,
				lastName,
				email,
				hash: hashedPassword,
			};

			await usuarioRepository.createUser(newUser);

			return res.json({ message: "Usuário criado com sucesso." });
		} catch (error: any) {
			return res.status(500).json({ error: error.message });
		}
	}

	async login(req: Request, res: Response): Promise<any> {
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
					cliente: existingUser.firstName,
					email: existingUser.email,
				},
				env.jwtSecret,
				{ expiresIn: "1h" }
			);

			return res.json({ token: token.toString() });
		} catch (error: any) {
			return res.json({ error: error.message });
		}
	}
}

export default new UsuarioController();
