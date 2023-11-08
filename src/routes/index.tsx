import type { AvailableInputTypes } from "~/components/available-fields-menu/availableFieldMenu";
import type { DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal, useStore } from "@builder.io/qwik";
import AvailableFieldMenu from "~/components/available-fields-menu/availableFieldMenu";
import FormLayoutDisplay from "~/components/formLayoutDisplay/formLayoutDisplay";

export interface FormEntity {
  id: string;
  type: AvailableInputTypes | "column" | "section";
  label: string | null;
  name: string | null;
  mendatory?: boolean;
  parentId: string | null;
}

export interface FormLayout {
  sections: FormEntity[];
  columns: FormEntity[];
  fields: FormEntity[];
}

const createEntity = (
  type: AvailableInputTypes | "column" | "section",
  parentId?: string
) => ({
  id: (() => crypto.randomUUID())(),
  type: type,
  label: null,
  name: null,
  parentId: parentId || null,
});

export default component$(() => {
  const selectedInputType = useSignal<AvailableInputTypes | null>(null);
  const isPreview = useSignal(false);
  const menuState = useSignal<"add" | "edit">("add");
  const initailId = (() => crypto.randomUUID())();

  const formLayout = useStore<FormLayout>({
    sections: [
      {
        id: initailId,
        type: "section",
        label: null,
        name: null,
        parentId: null,
      },
    ],
    columns: new Array(2).fill(0).map(() => ({
      id: (() => crypto.randomUUID())(),
      type: "column",
      label: null,
      name: null,
      parentId: initailId,
    })),
    fields: [],
  });

  /* useTask$(({ track }) => {
    track(() => selectedInputType.value);
    if (selectedInputType.value) {
      insertIntoFormLayout(selectedInputType.value);
      selectedInputType.value = null;
    }
  }); */

  const addColumnAfter = $((columnId: string) => {
    const columns = [...formLayout.columns];
    const columnIndex = columns.findIndex(({ id }) => id === columnId);
    if (columnIndex >= 0) {
      const newEntity = createEntity("column");
      newEntity.parentId = columns[columnIndex].parentId;

      formLayout.columns = [
        ...columns.slice(0, columnIndex + 1),
        { ...newEntity },
        ...columns.slice(columnIndex + 1),
      ];
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
                <div>
                  <FormLayoutDisplay
                    formLayout={formLayout}
                    isPreview={isPreview}
                    addColumnAfter={addColumnAfter}
                  />
                  {/* <pre>{JSON.stringify(formLayout, null, 2)}</pre> */}
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
