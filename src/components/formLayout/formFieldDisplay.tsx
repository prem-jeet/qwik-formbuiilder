import { $, component$ } from "@builder.io/qwik";
import type { FormEntity } from "~/routes";

interface Props {
  fieldEntity: FormEntity;
}

export default component$<Props>(({ fieldEntity }) => {
  const generateField = $(() => {
    const { type, id } = fieldEntity;

    if (type === "long-text") {
      return (
        <>
          <label for={id} class="form-label text-muted">
            {fieldEntity.label || "(no label)"}
          </label>
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
        <select class="form-select">
          <option selected>Select menu</option>
        </select>
      );
    } else if (type === "number") {
      return (
        <>
          <label for={id} class="form-label text-muted">
            {fieldEntity.label || "(no label)"}
          </label>
          <input type="number" class="form-control" id={id} />
        </>
      );
    } else {
      return (
        <>
          <label for={id} class="form-label text-muted">
            {fieldEntity.label || "(no label)"}
          </label>
          <input type="text" class="form-control" id={id} />
        </>
      );
    }
  });
  return <>{generateField()}</>;
});
