import type { FunctionComponent } from "preact";
import type { Handler, HandlerMapping, Params, Pipeline } from "wren";

export interface PageProps<T = unknown> {
	url: URL;
	params: Params;
	data: T;
}

export interface Manifest {
	routes: Record<string, RouteModule>;
}

export interface RouteModule {
	default?: PageComponent;
	handler?: Handler | HandlerMapping | Pipeline;
}

// FIXME ask Michal
export type PageComponent<T = any> = FunctionComponent<PageProps<T>>;
