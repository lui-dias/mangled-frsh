import { Signal } from "@preact/signals";
import { ComponentChildren } from "preact";

export default function PartialTrigger(
  props: {
    class: string;
    href: string;
    partial?: string;
    loading?: Signal<boolean>;
    children?: ComponentChildren;
  },
) {
  return (
    <a
      class={props.class}
      href={props.href}
      fh-partial={props.partial}
      fh-loading={props.loading}
    >
      {props.children}
    </a>
  );
}
