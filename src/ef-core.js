// Import everything
import {EFBaseComponent, EFNodeWrapper, EFTextFragment, Fragment, toEFComponent} from './lib/renderer.js'
import {applyMountingPoint} from './lib/creator.js'
import mountOptions from './mount-options.js'
import createElement from './lib/jsx-create-element.js'
import mapAttrs from './lib/map-attrs.js'
import {onNextRender, inform, exec, bundle, isPaused} from './lib/render-queue.js'
import dbg from './lib/utils/debug.js'
import typeOf from './lib/utils/type-of.js'
import scoped from './lib/utils/scoped-component.js'
import {setDOMSimulation} from './lib/utils/dom-helper.js'
import {version} from '../package.json'

// Apply mounting point properties for classes
const applyMountingPoints = (node, tpl) => {
	const nodeType = typeOf(node)
	switch (nodeType) {
		case 'array': {
			const [info, ...childNodes] = node
			if (typeOf(info) === 'object') for (let i of childNodes) applyMountingPoints(i, tpl)
			break
		}
		case 'object': {
			if (node.t > 1) throw new TypeError(`[EF] Not a standard ef.js AST: Unknown mounting point type '${node.t}'`)
			applyMountingPoint(node.t, node.n, tpl)
			break
		}
		case 'string': {
			break
		}
		default: {
			throw new TypeError(`[EF] Not a standard ef.js AST: Unknown node type '${nodeType}'`)
		}
	}
}

/**
 * @typedef {import('./mount-options.js').EFMountOption} EFMountOption
 * @typedef {import('./mount-options.js').EFMountConfig} EFMountConfig
 * @typedef {import('./lib/renderer.js').EFAST} EFAST
 * @typedef {import('./lib/renderer.js').EFBaseClass} EFBaseClass
 * @typedef {import('./lib/renderer.js').EFEventHandlerArg} EFEventHandlerArg
 * @typedef {import('./lib/renderer.js').EFEventHandlerMethod} EFEventHandlerMethod
 * @typedef {import('./lib/renderer.js').EFSubscriberHandlerArg} EFSubscriberHandlerArg
 * @typedef {import('./lib/renderer.js').EFSubscriberHandlerMethod} EFSubscriberHandlerMethod
 * @typedef {import('./lib/renderer.js').EFTemplateScope} EFTemplateScope
 * @typedef {import('./lib/renderer.js').Fragment} Fragment
 * @typedef {import('./lib/renderer.js').EFNodeWrapper} EFNodeWrapper
 * @typedef {import('./lib/renderer.js').EFTextFragment} EFTextFragment
 * @typedef {import('./lib/utils/event-helper.js').EFEventOptions} EFEventOptions
 */

// eslint-disable-next-line valid-jsdoc
/**
 * Create a brand new component class for the new component
 * @param {EFAST} ast - AST for the component
 */
const create = (ast) => {

	/**
	 * The very basic component which users can use
	 * @class EFComponent
	 * @param {Object=} initState - Initial state for the component to create with
	 * @param {EFTemplateScope=} scope - Scope for the component to render template with
	 */
	const EFComponent = class extends EFBaseComponent {

		/**
		 * Create an EFComponent with initial state
		 * @param {Object=} initState - Initial state for the component to create with
		 * @param {EFTemplateScope=} scope - Scope for the component to render template with
		 */
		constructor(initState, scope) {
			inform()
			super(ast, scope)
			if (initState) this.$update(initState)
			exec()
		}
	}
	applyMountingPoints(ast, EFComponent)

	// Workaround for a bug of buble
	// https://github.com/bublejs/buble/issues/197
	Object.defineProperty(EFComponent.prototype, 'constructor', {enumerable: false})
	return EFComponent
}

export {
	create,
	mapAttrs,
	createElement,
	EFNodeWrapper,
	EFTextFragment,
	Fragment,
	toEFComponent,
	scoped,
	onNextRender,
	inform,
	exec,
	bundle,
	isPaused,
	mountOptions,
	setDOMSimulation,
	version
}

if (process.env.NODE_ENV !== 'production') dbg.info(`ef-core v${version} initialized!`)
