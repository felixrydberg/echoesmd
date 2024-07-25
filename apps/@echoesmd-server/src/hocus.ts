import { createServer } from "./hocus/index";
import { createDb } from "./db";
import { options } from "./utils";

const { db } = await createDb(options);
const { server } = createServer(db, options);
server.listen
