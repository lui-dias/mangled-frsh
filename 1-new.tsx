import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
return (
    <button
    {...props}
    disabled={!IS_BROWSER || props.disabled}
    class="a b c d e f g h"
    />
);
}
