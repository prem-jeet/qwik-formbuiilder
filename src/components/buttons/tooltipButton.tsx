import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Tooltip } from "bootstrap";

interface Props {
  label?: string;
  size?: "sm" | "lg";
  bootstrapIconName?: string;
  tootltipPoition?: "top" | "right" | "bottom" | "left";
  tootlipText?: string;
  buttonClass?: string;
}

export default component$<Props>(
  ({
    buttonClass,
    tootlipText,
    tootltipPoition,
    bootstrapIconName,
    label,
    size,
  }) => {
    const ref = useSignal<HTMLElement>();
    useVisibleTask$(() => {
      new Tooltip(ref.value as unknown as string);
    });
    return (
      <button
        class={`btn   btn-${size} ${buttonClass}  `}
        data-bs-toggle="tooltip"
        data-bs-placement={tootltipPoition || "top"}
        title={tootlipText}
        ref={ref}
      >
        {label && <span>{label}</span>}
        {bootstrapIconName && (
          <i class={`${label && "ms - 2"} bi bi-${bootstrapIconName}`}></i>
        )}
      </button>
    );
  }
);
