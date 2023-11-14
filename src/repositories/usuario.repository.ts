import prisma from "@/configs/prismaCliente";

type CreateUser = {
	completeName: string;
	email: string;
	hash: string;
};

class UsuarioRepository {
	async findUser(email: string) {
		const user = await prisma.user.findUnique({ where: { email: email } });
		return user;
	}
	async createUser({ completeName, email, hash }: CreateUser) {
		try {
			const user = await prisma.user.create({
				data: {
					completeName,
					email,
					password: hash,
					role: "STUDENT",
				},
			});
			return {
				id: user.id,
				firstName: user.completeName,
				email: user.email,
			};
		} catch (error) {
			throw new Error("Failed to create user");
		}
	}
}

export default new UsuarioRepository();
