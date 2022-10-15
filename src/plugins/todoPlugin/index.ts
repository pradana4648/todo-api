import type { Plugin, PluginBase } from "@hapi/hapi";
import type { Todo } from "@prisma/client";
import Joi from "joi";

const payloadSchema = Joi.object({
  name: Joi.string().min(4).required(),
  description: Joi.string().min(4).required(),
  isCompleted: Joi.boolean().default(false),
});

interface TodoResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
  totalResult: number;
}

const todoPlugin: Plugin<PluginBase<{}>> = {
  name: "app/todo",
  dependencies: ["prisma"],
  register: async function (server) {
    const prisma = server.app.prisma;

    server.route([
      /// Get All Todos
      {
        method: "GET",
        path: "/",
        handler: async (req, h) => {
          req.log("read", "GET ALL TODOS");
          const todos = await prisma.todo.findMany();
          const response: TodoResponse<Todo[]> = {
            statusCode: 200,
            message: "success",
            data: todos.length === 0 ? null : todos,
            totalResult: todos.length,
          };
          return h.response(response).code(200);
        },
      },

      /// Get Single Todo
      {
        method: "GET",
        path: "/{id}",
        handler: async function (req, h) {
          const id = req.params["id"];
          const singleTodo = await prisma.todo.findFirst({
            where: {
              id: id,
            },
          });
          const response: TodoResponse<Todo> = {
            statusCode: 200,
            message: "success",
            data: singleTodo,
            totalResult: 1,
          };
          return h.response(response).code(200);
        },
      },

      /// Insert New Todo
      {
        method: "POST",
        path: "/",
        handler: async (req, h) => {
          const { name, description, isCompleted } = req.payload as {
            name?: string;
            description?: string;
            isCompleted?: boolean;
          };

          req.log("ADDED TODO ", name);

          // Validate proccess
          const values = payloadSchema.validate({
            name,
            description,
            isCompleted,
          });

          const todo = await prisma.todo.create({
            data: {
              name: values.value.name,
              description: values.value.description,
              isCompleted: values.value.isCompleted,
            },
          });

          const response: TodoResponse<Todo> = {
            statusCode: 201,
            message: "success",
            data: todo,
            totalResult: 1,
          };

          return h.response(response).code(201);
        },
        options: {
          validate: {
            payload: payloadSchema,
          },
        },
      },

      /// Update Todo
      {
        method: "PUT",
        path: "/id/{id}",
        handler: async function (req, h) {
          req.log("Update todo with id ", req.params["id"]);

          const id = req.params["id"];
          const parsedId = parseInt(id);
          if (isNaN(parsedId)) {
            return h
              .response({
                statusCode: 400,
                message: "Id is not a number",
              })
              .code(400);
          }

          const { name, description, isCompleted } = req.payload as {
            name?: string;
            description?: string;
            isCompleted?: boolean;
          };

          // Validate proccess
          const values = payloadSchema.validate({
            name,
            description,
            isCompleted,
          });

          const updatedTodo = await prisma.todo.update({
            where: {
              id: parsedId,
            },
            data: {
              name: values.value.name,
              description: values.value.description,
              isCompleted: values.value.isCompleted,
            },
          });

          const response: TodoResponse<Todo> = {
            statusCode: 200,
            message: "success updated todo",
            data: updatedTodo,
            totalResult: 1,
          };

          return h.response(response).code(200);
        },
        options: {
          validate: {
            payload: payloadSchema,
          },
        },
      },

      /// Delete todo
      {
        method: "DELETE",
        path: "/id/{id}",
        handler: async function (req, h) {
          const id = req.params["id"];
          const parsedId = parseInt(id);
          if (isNaN(parsedId)) {
            return h
              .response({
                statusCode: 400,
                message: "Id is not a number",
              })
              .code(400);
          }

          const deletedTodo = await prisma.todo.delete({
            where: {
              id: parsedId,
            },
          });

          const response: TodoResponse<Todo> = {
            statusCode: 200,
            message: `success delete Todo with id ${id}`,
            data: deletedTodo,
            totalResult: 1,
          };

          return h.response(response).code(200);
        },
      },
    ]);
  },
};

export default todoPlugin;
