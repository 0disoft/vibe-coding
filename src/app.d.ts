import type { ParaglideLocals } from '@inlang/paraglide-sveltekit';

import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
import type { ThemeMode, ThemePalette } from '$lib/shared/utils/theme';

/**
 * SvelteKit 전역 타입 정의
 *
 * 타입 관리 전략:
 * - app.d.ts는 전역 인터페이스(Locals, PageData 등) 확장용 진입점
 * - 비즈니스 로직 타입(User, Auth 등)은 $lib/types/에서 정의 후 여기서 import
 * - 예: import type { User } from '$lib/types/user';
 *
 * @see https://svelte.dev/docs/kit/types#app.d.ts
 */
declare global {
	namespace svelteHTML {
		type CapProgressEventDetail = {
			progress: number;
		};

		type CapSolveEventDetail = {
			token: string;
		};

		type CapErrorEventDetail = {
			isCap: boolean;
			message: string;
		};

		type CapResetEventDetail = Record<string, never>;

		interface IntrinsicElements {
			'cap-widget': {
				id?: string;
				class?: string;
				style?: string;
				'data-hide-credits'?: string;
				'data-cap-api-endpoint'?: string;
				'data-cap-worker-count'?: number;
				'data-cap-hidden-field-name'?: string;
				'aria-describedby'?: string;
				'aria-invalid'?: string;
				'aria-required'?: string;
				onsolve?: (event: CustomEvent<CapSolveEventDetail>) => void;
				onprogress?: (event: CustomEvent<CapProgressEventDetail>) => void;
				onerror?: (event: CustomEvent<CapErrorEventDetail>) => void;
				onreset?: (event: CustomEvent<CapResetEventDetail>) => void;
				[key: `data-cap-i18n-${string}`]: string | undefined;
			};
		}
	}

	namespace App {
		interface Error {
			requestId?: string;
			message: string;
		}
		interface Locals {
			paraglide: ParaglideLocals<AvailableLanguageTag>;
			theme: 'light' | 'dark' | null;
			themeMode: ThemeMode | null;
			themePalette: ThemePalette | null;
			fontSize: string | null;
			requestId: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}
