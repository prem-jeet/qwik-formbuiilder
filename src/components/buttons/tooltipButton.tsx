import type { QRL, NoSerialize } from "@builder.io/qwik";
import {
  $,
  component$,
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Tooltip } from "bootstrap";

interface Props {
  label?: string;
  size?: "sm" | "lg";
  bootstrapIconName?: string;
  tootltipPoition?: "top" | "right" | "bottom" | "left";
  tootlipText?: string;
  buttonClass?: string;
  onClick: QRL<() => {}>;
}

export default component$<Props>(
  ({
    buttonClass,
    tootlipText,
    tootltipPoition,
    bootstrapIconName,
    label,
    size,
    onClick,
  }) => {
    const ref = useSignal<Element>();
    const toltip = useStore<{
      tootltipInstance: NoSerialize<{ [key: string]: any }>;
    }>({
      tootltipInstance: noSerialize({}),
    });

    const close = $(() => {
      onClick();
      if (toltip.tootltipInstance) {
        toltip.tootltipInstance.hide();
      }
    });

    useVisibleTask$(() => {
      if (ref.value) {
        const t = new Tooltip(ref.value);
        toltip.tootltipInstance = noSerialize(t);
      }
    });
    return (
      <button
        class={`btn   btn-${size} ${buttonClass}  `}
        data-bs-toggle="tooltip"
        data-bs-placement={tootltipPoition || "top"}
        title={tootlipText}
        ref={ref}
        onClick$={close}
      >
        {label && <span>{label}</span>}
        {bootstrapIconName && (
          <i class={`${label && "ms - 2"} bi bi-${bootstrapIconName}`}></i>
        )}
      </button>
    );
  }
);
