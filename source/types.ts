import { Middleware } from "retes";

export interface Resource {
  feature: string;
  alias?: string;
  children?: Resource[];
}

export interface Meta {
  summary?: string;
  description?: string;
  parameters?: Array<any>;
  responses?: Object;
}

export interface Payload {
  [key: string]: any;
}

export type Task = (input: Payload) => Promise<void>;
export type Queue = any;

export interface ScheduleInput {
  task: Task;
  payload?: Payload;
  queue?: Queue;
  runAt?: Date;
  maxAttempts?: number;
}


// export interface Routes {
//   // FIXME [plug1, plug2, ..., plugk, handler] what's the type?
//   [name: string]: Handler | any[]
// }