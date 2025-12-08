<script lang="ts">
	import CodeBlock from '$lib/components/CodeBlock.svelte';

	// TOML 코드 예시
	const tomlCode = `[package]
name = "my-app"
version = "1.0.0"
edition = "2024"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

[dev-dependencies]
pretty_assertions = "1.4"`;

	// TypeScript 코드 예시
	const tsCode = `interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
}

const user = await fetchUser(123);
console.log(user.name);`;
</script>

<div class="container py-12">
	<h1 class="mb-8 text-center text-3xl font-bold">CodeBlock 테스트</h1>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		<!-- TOML 예시 (왼쪽) -->
		<div>
			<h2 class="mb-4 text-xl font-semibold">TOML</h2>
			<CodeBlock code={tomlCode} language="toml" />
		</div>

		<!-- TypeScript 예시 (오른쪽) -->
		<div>
			<h2 class="mb-4 text-xl font-semibold">TypeScript</h2>
			<CodeBlock code={tsCode} language="typescript" />
		</div>
	</div>
</div>
