import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4321);

createServer((_request, response) => {
  response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  response.end("Manager placeholder server\n");
}).listen(port, () => {
  console.log(`Manager placeholder server listening on ${port}`);
});
