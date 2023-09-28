import type { Signal } from '@preact/signals'
import { Button } from '../components/Button.tsx'
import { useEffect } from 'preact/hooks'

interface CounterProps {
	count: Signal<number>
}

export default function Counter(props: CounterProps) {
    useEffect(() => {
        setTimeout(() => {
            document.querySelector('.qwertyuiop')?.classList.add('text-yellow-500')
        }, 3000)
    }, [])

	return (
		<div class='qwertyuiop flex gap-8 py-6 bg-blue-500 hover:bg-red-500 bg-blue-500 hover:bg-red-500 group group-hover:marker:text-6xl'>
			<Button onClick={() => props.count.value -= 1}>-1</Button>
			<p class='text-3xl'>{props.count}</p>
			<Button onClick={() => props.count.value += 1}>+1</Button>
            <p class='text-yellow-500'>AAAAAAAAAAa</p>
		</div>
	)
}
