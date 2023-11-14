import runnerScriptController from "@/controllers/runnerScript.controller";
import usuarioController from "@/controllers/usuario.controller";
import { authenticateToken } from "@/middlewares/authenticateToken";
import { Router } from "express";

const routes = Router();

routes.post("/run", runnerScriptController.run);

routes.post("/cadastro", usuarioController.cadastro);
routes.post("/login", usuarioController.login);

export default routes;
