import type { QRL } from "@builder.io/qwik";
import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import type { FormEntity } from "~/routes";

export type AvailableInputTypes =
  | "text"
  | "select"
  | "checkbox"
  | "long-text"
  | "number";

const availableInputType: AvailableInputTypes[] = [
  "text",
  "select",
  "checkbox",
  "long-text",
  "number",
];
interface Props {
  addInputField: QRL<(newEntity: FormEntity) => {}>;
}

export default component$<Props>(({ addInputField }) => {
  const fieldSearchFilter = useSignal("");

  const filteredAvailableInputTypes = useComputed$(() => {
    return availableInputType.filter((type) =>
      type.includes(fieldSearchFilter.value.toLocaleLowerCase())
    );
  });

  const createInput = $((type: AvailableInputTypes) => {
    const newEntity: FormEntity = {
      label: null,
      name: null,
      id: (() => crypto.randomUUID())(),
      parentId: null,
      type,
    };

    addInputField({ ...newEntity });
  });

  return (
    <>
      <div>
        <div class="input-group mb-3">
          <span class="input-group-text ">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            class="form-control"
            placeholder="search fields"
            bind:value={fieldSearchFilter}
          />
        </div>
        <div>
          <div class="row row-cols-2 gy-3">
            {filteredAvailableInputTypes.value.map((type) => (
              <>
                <div class="col">
                  <button
                    type="button"
                    class="w-100 btn btn-light btn-sm border border-2 "
                    onClick$={() => createInput(type)}
                  >
                    {type.split("-").join(" ").toLocaleUpperCase()}
                  </button>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
});
