define(['taoQtiTest/runner/proxy/cache/preloaders/interactions/preloaders', 'taoQtiTest/runner/proxy/cache/preloaderManager'], function (preloaders, preloaderManagerFactory) { 'use strict';

	preloaders = preloaders && Object.prototype.hasOwnProperty.call(preloaders, 'default') ? preloaders['default'] : preloaders;
	preloaderManagerFactory = preloaderManagerFactory && Object.prototype.hasOwnProperty.call(preloaderManagerFactory, 'default') ? preloaderManagerFactory['default'] : preloaderManagerFactory;

	/*
	 * This program is free software; you can redistribute it and/or
	 * modify it under the terms of the GNU General Public License
	 * as published by the Free Software Foundation; under version 2
	 * of the License (non-upgradable).
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program; if not, write to the Free Software
	 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
	 *
	 * Copyright (c) 2021 Open Assessment Technologies SA
	 */
	/**
	 * @callback interactionPreloaderManagerAction
	 * @param {string} type - The type of asset to preload
	 * @param {object} interaction - The interaction
	 * @param {object} itemData - The item data
	 * @param {string} itemIdentifier - the id of the item the interaction belongs to
	 */

	/**
	 * @callback interactionPreloaderAction
	 * @param {object} interaction - The interaction
	 * @param {object} itemData - The item data
	 * @param {string} itemIdentifier - the id of the item the interaction belongs to
	 */

	/**
	 * @typedef {object} interactionPreloaderManager
	 * @property {string} name - The name of the preloader
	 * @property {interactionPreloaderManagerAction} loaded - Tells whether an interaction is loaded or not
	 * @property {interactionPreloaderManagerAction} load - Preload an interaction
	 * @property {interactionPreloaderManagerAction} unload - Unload an interaction
	 */

	/**
	 * @typedef {object} interactionPreloader
	 * @property {string} name - The name of the preloader
	 * @property {interactionPreloaderAction} loaded - Tells whether an interaction is loaded or not
	 * @property {interactionPreloaderAction} load - Preload an interaction
	 * @property {interactionPreloaderAction} unload - Unload an interaction
	 */

	/**
	 * Manages the preloading of assets
	 * @function assetPreloaderFactory
	 * @param assetManager - A reference to the assetManager
	 * @return {assetPreloaderManager}
	 */

	var interactionPreloaderFactory = preloaderManagerFactory();
	preloaders.forEach(function (preloader) {
	  return interactionPreloaderFactory.registerProvider(preloader.name, preloader);
	});

	return interactionPreloaderFactory;

});
