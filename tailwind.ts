import { bundle } from './bundler.ts'

export const TO = './static/tailwind.css'
export const FROM = './tailwind.css'

import { expandGlobSync } from '$std/fs/expand_glob.ts'

const letters = 'abcdefghijklmnopqrstuvwxyz'

function mini() {
	const n = [0]

	return () => {
		let s = ''

		for (const i of n) {
			s += letters[i]
		}

		const last = n[n.length - 1]

		if (last < letters.length - 1) {
			n[n.length - 1] = last + 1
		} else {
			n.push(0)
		}

		return s
	}
}

const m = mini()
const classesMap = new Map<string, string>()

export async function gen() {
	for (const f of expandGlobSync('{components,islands}/**/*.tsx')) {
		const text = Deno.readTextFileSync(f.path)
		const matches = [
			...text.matchAll(/(class|className)=['"](?<classes>[\s\S]+?)['"]/mig),
		]

		const matchedClasses = matches.flatMap((i) =>
			i?.groups?.classes &&
			i.groups.classes.trim().split(' ').map((i) => i.trim())
		).filter(Boolean) as string[]

		for (const i of matchedClasses) {
			if (!classesMap.has(i)) {
				classesMap.set(i, m())
			}
		}
	}

	await Deno.writeTextFile(
		'minify-map.json',
		JSON.stringify(Object.fromEntries([...classesMap]), null, 4),
	)
}

await gen()
await bundle({
	to: TO,
	from: FROM,
	map: new Map<string, string>(
		Object.entries(JSON.parse(Deno.readTextFileSync('minify-map.json'))),
	),
})
