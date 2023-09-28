import type { Signal } from '@preact/signals'
import { Button } from '../components/Button.tsx'
import { useEffect } from 'preact/hooks'

interface CounterProps {
	count: Signal<number>
}

export default function Counter(props: CounterProps) {
    useEffect(() => {
        setTimeout(() => {
            document.querySelector('.i')?.classList.add('r')
        }, 3000)
    }, [])

	return (
		<div class='i j k l m n m n o o-hover:marker:text-6xl'>
			<Button onClick={() => props.count.value -= 1}>-1</Button>
			<p class='q'>{props.count}</p>
			<Button onClick={() => props.count.value += 1}>+1</Button>
            <p class='r'>AAAAAAAAAAa</p>
		</div>
	)
}
