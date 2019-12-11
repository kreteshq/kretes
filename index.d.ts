declare module 'huncwot' {
  interface Request {
    params: {
      [name: string]: any
    }
  }

  type Response = string | { body: string } | Promise<string> | Promise<{ body: string }>;

  type Handler = (request: Request) => Response;

  interface Routes {
    DELETE?: {
      [name: string]: Handler
    },
    GET?: {
      [name: string]: Handler
    },
    HEAD?: {
      [name: string]: Handler
    },
    OPTIONS?: {
      [name: string]: Handler
    }
    PATCH?: {
      [name: string]: Handler
    },
    POST?: {
      [name: string]: Handler
    },
    PUT?: {
      [name: string]: Handler
    },
  }

  export { Handler, Routes, Request, Response }
}

declare module 'huncwot/response' {
  function OK(_: any): Response;

  export { OK };
}
