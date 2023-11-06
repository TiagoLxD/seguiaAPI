/* eslint-disable @typescript-eslint/no-var-requires */
import "./configs/moduleAlias";

import app from "./app";
import { env } from "./configs/env";

app.listen(env.port, () => console.log(`listening on ${env.port}`));
