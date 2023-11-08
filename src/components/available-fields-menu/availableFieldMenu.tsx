import type { Signal } from "@builder.io/qwik";
import { component$, useComputed$, useSignal } from "@builder.io/qwik";

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
  selectedInput: Signal<AvailableInputTypes | null>;
}
export default component$<Props>(({ selectedInput }) => {
  const fieldSearchFilter = useSignal("");

  const filteredAvailableInputTypes = useComputed$(() => {
    return availableInputType.filter((type) =>
      type.includes(fieldSearchFilter.value.toLocaleLowerCase())
    );
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
                    class="w-100 btn btn-light border border-2 "
                    onClick$={() => (selectedInput.value = type)}
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
