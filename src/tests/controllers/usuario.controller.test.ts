import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import usuarioRepository from "@/repositories/usuario.repository";
import UsuarioController from "@/controllers/usuario.controller";
import { describe, beforeEach, expect, it, vitest } from "vitest";
import bcrypt from "bcrypt";

vitest.mock("../../repositories/usuario.repository");

describe("UsuarioController", () => {
	let usuarioController: typeof UsuarioController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		usuarioController = UsuarioController;
		req = {} as Request;
		res = {} as Response;
		res.status = vitest.fn().mockReturnThis();
		res.json = vitest.fn().mockReturnThis();
	});

	describe("login", () => {
		it("should return an error if user does not exist", async () => {
			req.body = {
				email: "teste@example.com",
				password: "password123",
			};

			const findUserMock = vitest
				.spyOn(usuarioRepository, "findUser")
				.mockResolvedValueOnce(null);

			await usuarioController.login(req, res);

			expect(findUserMock).toHaveBeenCalledWith("teste@example.com");
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({ error: "Usuário ou senha errado" });
		});
	});

	it("should return a token if login is successful", async () => {
		req.body = {
			email: "existinguser@example.com",
			password: "correctpassword",
		};

		const existingUser = {
			id: 123,
			completeName: "Existing User",
			email: "existinguser@example.com",
			password: await bcrypt.hash("correctpassword", 10),
			role: "user",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const findUserMock = vitest
			.spyOn(usuarioRepository, "findUser")
			.mockResolvedValueOnce(existingUser);

		const compareMock = vitest.spyOn(bcrypt, "compare").mockReturnValueOnce(undefined);

		vitest.spyOn(jwt, "sign").mockImplementationOnce(() => "mockedToken");

		await usuarioController.login(req, res);

		expect(findUserMock).toHaveBeenCalledWith("existinguser@example.com");
		expect(compareMock).toHaveBeenCalledWith("correctpassword", existingUser.password);
	});

	describe("Cadastro", () => {
		it("should return error for invalid data", async () => {
			req.body = {};

			await usuarioController.cadastro(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalled();
		});
	});

	it("should create a new user successfully", async () => {
		req.body = {
			completeName: "Test User",
			email: "newuser@example.com",
			password: "password123",
		};
		await bcrypt.hash(req.body.password, 10);

		vitest.spyOn(usuarioRepository, "findUser").mockResolvedValueOnce(null);
		vitest.spyOn(usuarioRepository, "createUser").mockResolvedValueOnce({
			id: 1,
			firstName: "Test User",
			email: "newuser@example.com",
		});

		await usuarioController.cadastro(req, res);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuário criado com sucesso." });
	});
});
