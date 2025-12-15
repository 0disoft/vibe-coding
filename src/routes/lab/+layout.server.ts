import { error } from '@sveltejs/kit';

import { dev } from '$app/environment';

export const load = async () => {
	const labEnabled = process.env.LAB_ENABLED === '1';

	if (!dev && !labEnabled) {
		throw error(404, 'Not found');
	}

	return {};
};
