import { Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Modal } from "bootstrap";

interface Props {
  bodyText: string;
  headerText: string;
  persistant?: boolean;
  escapeClose?: boolean;
  id: string;
  triggerLabel?: string;
  triggerBIcon?: string;
  triggerClass?: string;
}

export default component$<Props>(
  ({
    bodyText,
    headerText,
    persistant,
    escapeClose,
    id,
    triggerLabel,
    triggerClass,
    triggerBIcon,
  }) => {
    const ref = useSignal<Element>();

    useVisibleTask$(() => {
      if (ref.value) {
        new Modal(ref.value, {
          keyboard: !!escapeClose,
        });
      }
    });
    return (
      <>
        <button
          type="button"
          class={`btn  ${triggerClass || "btn-primary"}`}
          data-bs-toggle="modal"
          data-bs-target={`#${id}-modal`}
        >
          {triggerLabel || (!triggerBIcon && "Modal")}
          {triggerBIcon && (
            <i class={`bi bi-${triggerBIcon} ${triggerLabel && "ms-2"}`}></i>
          )}
        </button>

        <div
          class="modal fade"
          id={`${id}-modal`}
          ref={ref}
          data-bs-backdrop={persistant && "static"}
          data-bs-keyboard="false"
          tabIndex={-1}
          aria-labelledby="staticBackdropLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title fw-bold" id="staticBackdropLabel">
                  {headerText}
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">{bodyText}</div>
              <div class="modal-footer" data-bs-dismiss="modal">
                <Slot name="footer" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);
