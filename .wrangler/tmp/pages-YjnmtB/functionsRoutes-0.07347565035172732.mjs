import { onRequest as __api_auth_js_onRequest } from "/home/claude/aeronotes/functions/api/auth.js"
import { onRequest as __api_comments_js_onRequest } from "/home/claude/aeronotes/functions/api/comments.js"
import { onRequest as ___middleware_js_onRequest } from "/home/claude/aeronotes/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_auth_js_onRequest],
    },
  {
      routePath: "/api/comments",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_comments_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]