export const env = {
	mongoUri: process.env.DATABASE_URL ?? "file:./dev.db",
	jwtSecret: process.env.JWT_SECRET ?? "secret",
	jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "secret",
	port: process.env.PORT ?? 5000,
	environment: process.env.NODE_ENV ?? "development",
};
