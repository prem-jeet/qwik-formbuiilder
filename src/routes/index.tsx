import type { AvailableInputTypes } from "~/components/available-fields-menu/availableFieldMenu";
import { $, component$, useSignal, useStore } from "@builder.io/qwik";
import AvailableFieldMenu from "~/components/available-fields-menu/availableFieldMenu";
import FormLayoutDisplay from "~/components/formLayout/formLayoutDisplay";

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

  const selectedSectionId = useSignal("");
  const selectedFieldId = useSignal("");
  const selectedColmnId = useSignal(formLayout.columns[0].id);

  const addColumnAfter = $((columnId: string) => {
    const columns = [...formLayout.columns];
    const columnIndex = columns.findIndex(({ id }) => id === columnId);
    if (columnIndex >= 0) {
      const newColumn = createEntity("column");
      newColumn.parentId = columns[columnIndex].parentId;

      formLayout.columns = [
        ...columns.slice(0, columnIndex + 1),
        { ...newColumn },
        ...columns.slice(columnIndex + 1),
      ];
      return newColumn.id;
    }
  });

  const addSectionAfter = $((sectionId?: string) => {
    const sections = [...formLayout.sections];
    const sectionIndex = sections.findIndex(({ id }) => id === sectionId);

    const newSection = createEntity("section");
    newSection.parentId = null;

    formLayout.sections = [
      ...sections.slice(0, sectionIndex + 1),
      { ...newSection },
      ...sections.slice(sectionIndex + 1),
    ];
    for (let i = 0; i < 2; i++) {
      const newColumn = createEntity("column");
      newColumn.parentId = newSection.id;
      formLayout.columns.push({ ...newColumn });
    }
  });
  const addInputField = $((newEntity: FormEntity) => {
    if (selectedColmnId.value)
      formLayout.fields.push({ ...newEntity, parentId: selectedColmnId.value });
  });

  const removeField = $((fieldId: string) => {
    const fieldIndex = formLayout.fields.findIndex(
      (field) => field.id === fieldId
    );
    if (fieldIndex >= 0) {
      formLayout.fields = [
        ...formLayout.fields.slice(0, fieldIndex),
        ...formLayout.fields.slice(fieldIndex + 1),
      ];
    }
  });

  const duplicateField = $((fieldId: string) => {
    const fieldIndex = formLayout.fields.findIndex(
      (field) => field.id === fieldId
    );
    const newField = { ...formLayout.fields[fieldIndex] };
    newField.id = crypto.randomUUID();
    newField.name = null;
    if (newField.label) {
      newField.label = newField.label + " copy";
    }

    formLayout.fields = [
      ...formLayout.fields.slice(0, fieldIndex + 1),
      { ...newField },
      ...formLayout.fields.slice(fieldIndex + 1),
    ];
  });

  const moveFieldsToNewColumn = $(async (startingFieldId: string) => {
    selectedFieldId.value = "";
    const fieldIndex = formLayout.fields.findIndex(
      (field) => field.id === startingFieldId
    );
    const parentColumnId = formLayout.fields[fieldIndex].parentId;

    if (parentColumnId) {
      const newColumnId = await addColumnAfter(parentColumnId);
      if (newColumnId) {
        formLayout.fields = formLayout.fields.map((field, index) => {
          if (index < fieldIndex) {
            return field;
          }
          return {
            ...field,
            parentId: newColumnId,
          };
        });
      }
    }
  });
  return (
    <>
      <div class="vw-100 vh-100 overflow-hidden">
        <div class="container-fluid">
          {" "}
          <div class="row px-4 py-5 vh-100 justify-content-between ">
            <div class="col-2">
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
                  <AvailableFieldMenu addInputField={addInputField} />
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
                    addSectionAfter={addSectionAfter}
                    selectedColmnId={selectedColmnId}
                    selectedSectionId={selectedSectionId}
                    selectedFieldId={selectedFieldId}
                    removeField={removeField}
                    moveFieldsToNewColumn={moveFieldsToNewColumn}
                    duplicateField={duplicateField}
                  />

                  {/* <pre>{JSON.stringify(formLayout.fields, null, 2)}</pre> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
