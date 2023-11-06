import type { AvailableInputTypes } from "~/components/available-fields-menu/availableFieldMenu";
import type { DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import AvailableFieldMenu from "~/components/available-fields-menu/availableFieldMenu";
import FormLayoutDisplay from "~/components/formLayoutDisplay/formLayoutDisplay";

export interface InputObject {
  type: AvailableInputTypes;
  label: string | null;
  name: string | null;
  mendatory: boolean;
  id: string;
}

export default component$(() => {
  const selectedInputType = useSignal<AvailableInputTypes | null>(null);
  const isPreview = useSignal(false);
  const menuState = useSignal<"add" | "edit">("add");
  const formLayout = useSignal<InputObject[]>([]);
  const editingFieldId = useSignal("");
  const insertIntoFormLayout = $((type: AvailableInputTypes) => {
    const newInputTypeObject: InputObject = {
      name: null,
      label: null,
      mendatory: false,
      type: type,
      id: (() => crypto.randomUUID())(),
    };
    formLayout.value = [...formLayout.value, { ...newInputTypeObject }];
  });

  useTask$(({ track }) => {
    track(() => selectedInputType.value);
    if (selectedInputType.value) {
      insertIntoFormLayout(selectedInputType.value);
      selectedInputType.value = null;
    }
  });

  return (
    <>
      <div class="vw-100 vh-100 overflow-hidden">
        <div class="container">
          <div class="row py-5 vh-100 justify-content-between">
            <div class="col-3">
              <div>
                <div class="btn-group d-flex" role="group">
                  <input
                    type="radio"
                    class="btn-check"
                    checked={menuState.value === "add"}
                    onClick$={() => (menuState.value = "add")}
                    id="menuState_add"
                  />
                  <label class="btn btn-outline-dark" for="menuState_add">
                    Input fields
                  </label>
                  <input
                    type="radio"
                    class="btn-check"
                    checked={menuState.value === "edit"}
                    onClick$={() => (menuState.value = "edit")}
                    id="menuState_edit"
                  />
                  <label class="btn btn-outline-dark" for="menuState_edit">
                    Edit field
                  </label>
                </div>
              </div>
              <div class="mt-3">
                {menuState.value === "add" ? (
                  <AvailableFieldMenu selectedInput={selectedInputType} />
                ) : (
                  <>edit field</>
                )}
              </div>
            </div>
            <div class="col px-5">
              <div>
                <div class="d-flex justify-content-end  mb-4">
                  <button
                    type="button"
                    class="btn btn-primary"
                    onClick$={() => (isPreview.value = !isPreview.value)}
                  >
                    {isPreview.value ? "Hide " : "Show "}Preview
                  </button>
                </div>
                {editingFieldId}
                <div>
                  <FormLayoutDisplay
                    formLayout={formLayout}
                    isPreview={isPreview}
                    editingFieldId={editingFieldId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
