import * as dotenv from "dotenv";
import Vision from "@hapi/vision";
import Hapi from "@hapi/hapi";
import prismaPlugin from "./plugins/prismaPlugin";
import todoPlugin from "./plugins/todoPlugin";
import Handlebars from "handlebars";

dotenv.config();

const init = async () => {
  const server = Hapi.server({
    debug: {
      request: ["*"],
      log: ["*"],
    },
    port: 3000,
    host: "localhost",
  });

  // Views
  await server.register({
    plugin: Vision,
  });

  server.views({
    engines: {
      html: Handlebars,
    },
    relativeTo: __dirname,
    path: "views",
    helpersPath: "views/helpers",
  });

  server.route({
    method: "GET",
    path: "/",
    handler: function (_, h) {
      return h.view("index");
    },
  });

  await server.register([
    {
      plugin: prismaPlugin,
    },
    {
      plugin: todoPlugin,
      routes: {
        prefix: "/todos",
      },
    },
  ]);

  await server.start();
  console.log(`Server running on %s`, server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
