import type { Config } from "@markdoc/markdoc";
import { Callout } from "./Callout.jsx";
import { Fence } from "./Fence.jsx";
import { Figure } from "./Figure.jsx";

/**
 * The components that render custom nodes or tags
 */
export const components = {
	Callout,
	Fence,
	Figure,
};

/**
 * The Markdoc configuration.
 */
export const config: Config = {
	nodes: {
		fence: {
			render: "Fence",
			attributes: {
				language: {
					type: "String",
				},
				content: {
					type: "String",
				},
			},
		},
	},
	/**
	 * Custom tags for MarkDoc.
	 *
	 * See https://markdoc.dev/docs/tags.
	 */
	tags: {
		Callout: {
			attributes: {
				title: { type: "String" },
				variant: {
					type: "String",
					matches: ["success", "info", "warning", "danger"],
					errorLevel: "error",
				},
			},
			render: "Callout",
		},
		Figure: {
			selfClosing: true,
			attributes: {
				src: { type: "String" },
				alt: { type: "String" },
				caption: { type: "String" },
			},
			render: "Figure",
		},
	},
};