declare module 'huncwot/response' {
  interface Request {
    params: {
      [name: string]: any
    }
  }

  type Response = string | { body: string };

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

  function OK(_: any): Response;

  export { Routes, Request, Response, OK }
}
