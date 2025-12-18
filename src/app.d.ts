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
