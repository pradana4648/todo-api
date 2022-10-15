import { PrismaClient } from "@prisma/client";
import type { Plugin, PluginBase } from "@hapi/hapi";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

const prismaPlugin: Plugin<PluginBase<{}>> = {
  name: "prisma",
  register: async function (server) {
    server.log("PRISMA CLIENT INITIALIZED");
    const prisma = new PrismaClient();

    server.app.prisma = prisma;

    server.ext({
      type: "onPostStop",
      method: async (server) => {
        server.app.prisma.$disconnect();
      },
    });
  },
};

export default prismaPlugin;
