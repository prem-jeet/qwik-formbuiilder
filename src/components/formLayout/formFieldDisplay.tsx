import type { QRL, Signal } from "@builder.io/qwik";
import { $, component$, useStylesScoped$ } from "@builder.io/qwik";
import type { FormEntity } from "~/routes";
import TooltipButton from "../buttons/tooltipButton";

interface Props {
  fieldEntity: FormEntity;
  selectedFieldId: Signal<string>;
  removeField: QRL<(fieldId: string) => {}>;
  duplicateField: QRL<(fieldId: string) => {}>;
  moveFieldsToNewColumn: QRL<(fieldId: string) => {}>;
  shouldAllowDetach: boolean;
  shouldShowUpButton: boolean;
  shouldShowDownButton: boolean;
  isPreview: Signal<boolean>;
  moveField: QRL<(fieldId: string, direction: "up" | "down") => {}>;
  editEntityId: Signal<string>;
}

export default component$<Props>(
  ({
    fieldEntity,
    selectedFieldId,
    removeField,
    duplicateField,
    moveFieldsToNewColumn,
    shouldAllowDetach,
    isPreview,
    shouldShowDownButton,
    shouldShowUpButton,
    moveField,
    editEntityId,
  }) => {
    useStylesScoped$(`
  .form-field:hover{
    outline: 1px solid black;
  }
  .outline-none:hover{
      outline: none;
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

    return (
      <div
        class={`p-2 rounded-3 form-field ${isPreview.value && "outline-none"}`}
      >
        <div class="row">
          {fieldEntity.type !== "checkbox" && (
            <div class="col">
              <label for={fieldEntity.id} class="form-label text-muted">
                {fieldEntity.label || "(no label)"}
              </label>
            </div>
          )}
          {!isPreview.value && selectedFieldId.value === fieldEntity.id && (
            <div
              class={`${fieldEntity.type === "checkbox" && "ms-auto"} col-auto`}
            >
              {shouldShowUpButton && (
                <button
                  class="btn btn-outline-dark p-0 px-1"
                  onClick$={() => moveField(fieldEntity.id, "up")}
                >
                  <i class="bi bi-caret-up-fill"></i>
                </button>
              )}
              {shouldShowDownButton && (
                <span class="ms-2">
                  <button
                    class="btn btn-outline-dark p-0 px-1"
                    onClick$={() => moveField(fieldEntity.id, "down")}
                  >
                    <i class="bi bi-caret-down-fill"></i>
                  </button>
                </span>
              )}
              {shouldAllowDetach && (
                <span class="ms-2">
                  <TooltipButton
                    buttonClass=" btn-outline-dark p-0 px-1"
                    size="sm"
                    tootlipText="Move current field and following fields to new column"
                    bootstrapIconName="box-arrow-in-up-right"
                    onClick={$(() => moveFieldsToNewColumn(fieldEntity.id))}
                  />
                </span>
              )}

              <span class="ms-2">
                <TooltipButton
                  buttonClass="btn-outline-dark p-0 px-1"
                  size="sm"
                  bootstrapIconName="copy"
                  tootlipText="Duplicate field"
                  onClick={$(() => duplicateField(fieldEntity.id))}
                />
              </span>
              <button
                class="btn btn-outline-dark p-0 px-1 ms-2"
                onClick$={() => (editEntityId.value = fieldEntity.id)}
              >
                <i class="bi bi-pen"></i>
              </button>
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
