import type { QRL, Signal } from "@builder.io/qwik";
import {
  $,
  component$,
  useOn,
  useSignal,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { FormEntity } from "~/routes";

interface Props {
  fieldEntity: FormEntity;
  selectedFieldId: Signal<string>;
  removeField: QRL<(fieldId: string) => {}>;
  moveFieldsToNewColumn: QRL<(fieldId: string) => {}>;
  shouldAllowDetach: boolean;
}

export default component$<Props>(
  ({
    fieldEntity,
    selectedFieldId,
    removeField,
    moveFieldsToNewColumn,
    shouldAllowDetach,
  }) => {
    useStylesScoped$(`
  .form-field:hover{
    outline: 1px solid black;
  }
  `);
    const generateField = $(() => {
      const { type, id } = fieldEntity;

      if (type === "long-text") {
        return (
          <>
            <textarea class="form-control" id={id} />
          </>
        );
      } else if (type === "checkbox") {
        return (
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id={id} />
            <label class="form-check-label text-muted" for={id}>
              {fieldEntity.label || "(no label)"}
            </label>
          </div>
        );
      } else if (type === "select") {
        return (
          <>
            <select class="form-select" id={id}>
              <option selected>Select menu</option>
            </select>
          </>
        );
      } else if (type === "number") {
        return (
          <>
            <input type="number" class="form-control" id={id} />
          </>
        );
      } else {
        return (
          <>
            <input type="text" class="form-control" id={id} />
          </>
        );
      }
    });
    const hoveringOver = useSignal(false);
    useOn(
      "mouseenter",
      $(() => {
        hoveringOver.value = true;
      })
    );
    useOn(
      "mouseleave",
      $(() => {
        hoveringOver.value = false;
      })
    );
    return (
      <div class="p-2 rounded-3 form-field">
        <div class="row">
          {fieldEntity.type !== "checkbox" && (
            <div class="col">
              <label for={fieldEntity.id} class="form-label text-muted">
                {fieldEntity.label || "(no label)"}
              </label>
            </div>
          )}
          {selectedFieldId.value === fieldEntity.id && (
            <div
              class={`${fieldEntity.type === "checkbox" && "ms-auto"} col-auto`}
            >
              {shouldAllowDetach && (
                <button
                  class="btn btn-outline-dark btn-sm p-0 px-1"
                  data-bs-toggle="tooltip"
                  title="Tooltip on top"
                  onClick$={() => moveFieldsToNewColumn(fieldEntity.id)}
                >
                  <i class="bi bi-box-arrow-in-up-right"></i>
                </button>
              )}
              <button
                class="ms-2 btn btn-outline-dark btn-sm  p-0 px-1"
                onClick$={() => removeField(fieldEntity.id)}
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          )}
        </div>

        {generateField()}
      </div>
    );
  }
);
