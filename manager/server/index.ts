import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

const port = Number(process.env.PORT ?? 4321);

createServer((_request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  response.end("Manager placeholder server\n");
}).listen(port, () => {
  console.log(`Manager placeholder server listening on ${port}`);
});
