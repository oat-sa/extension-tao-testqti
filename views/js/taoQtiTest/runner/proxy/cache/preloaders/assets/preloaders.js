define(['taoQtiTest/runner/proxy/cache/preloaders/assets/audio', 'taoQtiTest/runner/proxy/cache/preloaders/assets/image', 'taoQtiTest/runner/proxy/cache/preloaders/assets/stylesheet'], function (audioPreloader, imagePreloader, stylesheetPreloader) { 'use strict';

	audioPreloader = audioPreloader && Object.prototype.hasOwnProperty.call(audioPreloader, 'default') ? audioPreloader['default'] : audioPreloader;
	imagePreloader = imagePreloader && Object.prototype.hasOwnProperty.call(imagePreloader, 'default') ? imagePreloader['default'] : imagePreloader;
	stylesheetPreloader = stylesheetPreloader && Object.prototype.hasOwnProperty.call(stylesheetPreloader, 'default') ? stylesheetPreloader['default'] : stylesheetPreloader;

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
	 * The list of asset loader factories
	 * @type {Function[]}
	 */

	var preloaders = [audioPreloader, imagePreloader, stylesheetPreloader];

	return preloaders;

});
