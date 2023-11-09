import type { Signal } from "@builder.io/qwik";
import { $, component$, useOn, useSignal } from "@builder.io/qwik";
import type { FormEntity } from "~/routes";

interface Props {
  fieldEntity: FormEntity;
  selectedFieldId: Signal<string>;
}

export default component$<Props>(({ fieldEntity, selectedFieldId }) => {
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
  const shouldShowActions = useSignal(false);
  useOn(
    "mouseenter",
    $(() => {
      shouldShowActions.value = true;
    })
  );
  useOn(
    "mouseleave",
    $(() => {
      shouldShowActions.value = false;
    })
  );
  return (
    <div>
      {fieldEntity.type !== "checkbox" && (
        <div class="row">
          <div class="col">
            <label for={fieldEntity.id} class="form-label text-muted">
              {fieldEntity.label || "(no label)"}
            </label>
          </div>
          {(shouldShowActions.value ||
            selectedFieldId.value === fieldEntity.id) && (
            <div class="col-auto">
              <button class="btn btn-outline-dark btn-sm p-0 px-1">
                <i class="bi bi-box-arrow-in-up-right"></i>
              </button>
              <button class="ms-2 btn btn-outline-dark btn-sm  p-0 px-1">
                <i class="bi bi-x"></i>
              </button>
            </div>
          )}
        </div>
      )}
      {generateField()}
    </div>
  );
});
