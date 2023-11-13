import { Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Tooltip } from "bootstrap";

interface Props {
  title: string;
  tootltipPoition?: "top" | "right" | "bottom" | "left";
}

export default component$<Props>(({ title, tootltipPoition }) => {
  const ref = useSignal<Element>();

  useVisibleTask$(() => {
    if (ref.value) {
      new Tooltip(ref.value);
    }
  });

  return (
    <span
      data-bs-toggle="tooltip"
      data-bs-placement={tootltipPoition || "top"}
      title={title}
      ref={ref}
    >
      <Slot />
    </span>
  );
});
