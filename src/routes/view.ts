import type { ServerRoute } from "@hapi/hapi";

const viewRoute: ServerRoute[] = [
  {
    method: "GET",
    path: "/",
    handler: function (req, h) {
      req.log("Going to route ", req.path);
      return h.response("index");
    },
  },
];

export default viewRoute;
