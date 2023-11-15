import type { AvailableInputTypes } from "~/components/available-fields-menu/availableFieldMenu";
import { $, component$, useSignal, useStore, useTask$ } from "@builder.io/qwik";
import AvailableFieldMenu from "~/components/available-fields-menu/availableFieldMenu";
import FormLayoutDisplay from "~/components/formLayout/formLayoutDisplay";
export interface FormEntity {
  id: string;
  type: AvailableInputTypes | "column" | "section";
  label: string | null;
  name: string | null;
  mendatory?: boolean;
  parentId: string | null;
  childCount?: number;
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
        childCount: 2,
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

  useTask$(({ track }) => {
    track(() => isPreview.value);
    selectedSectionId.value = "";
    selectedColmnId.value = "";
    selectedFieldId.value = "";
  });

  // handle childCount
  const incrementChildCount = $((key: "sections" | "columns", id: string) => {
    const index = formLayout[key as keyof FormLayout].findIndex(
      (item: { id: string }) => item.id === id
    );
    if (index >= 0) {
      formLayout[key as keyof FormLayout][index].childCount! += 1;
    }
  });
  const decrementChildCount = $((key: "sections" | "columns", id: string) => {
    const index = formLayout[key as keyof FormLayout].findIndex(
      (item: { id: string }) => item.id === id
    );
    if (index >= 0) {
      formLayout[key as keyof FormLayout][index].childCount! -= 1;
    }
  });

  // adding column or section
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

      incrementChildCount("sections", newColumn.parentId!);
      return newColumn.id;
    }
  });

  const addSectionAfter = $((sectionId?: string, addColumns?: boolean) => {
    const sections = [...formLayout.sections];
    const sectionIndex = sections.findIndex(({ id }) => id === sectionId);

    const newSection = createEntity("section");
    newSection.parentId = null;

    formLayout.sections = [
      ...sections.slice(0, sectionIndex + 1),
      { ...newSection },
      ...sections.slice(sectionIndex + 1),
    ];
    if (addColumns) {
      for (let i = 0; i < 2; i++) {
        const newColumn = createEntity("column");
        newColumn.parentId = newSection.id;
        formLayout.columns.push({ ...newColumn });
      }
    }
    return newSection.id;
  });
  // Field related function
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
          if (index < fieldIndex || field.parentId !== parentColumnId) {
            return field;
          } else {
            return {
              ...field,
              parentId: newColumnId,
            };
          }
        });
      }
    }
  });

  const moveColumnsToNewSection = $(async (startingcolumnId: string) => {
    selectedColmnId.value = "";
    const columnIndex = formLayout.columns.findIndex(
      (column) => column.id === startingcolumnId
    );
    const parentSectionId = formLayout.columns[columnIndex].parentId;

    if (parentSectionId) {
      const newSectionId = await addSectionAfter(parentSectionId, false);
      formLayout.columns = formLayout.columns.map((column, index) => {
        if (index < columnIndex || column.parentId !== parentSectionId) {
          return column;
        } else {
          decrementChildCount("sections", parentSectionId);
          return {
            ...column,
            parentId: newSectionId,
          };
        }
      });
    }
  });

  // deletion related function
  const deleteColumnWithFields = $((columnId: string) => {
    formLayout.fields = formLayout.fields.filter(
      (field) => field.parentId !== columnId
    );
    formLayout.columns = formLayout.columns.filter((column) => {
      if (columnId === column.id && column.parentId) {
        decrementChildCount("sections", column.parentId);
        return false;
      }
      return true;
    });
  });

  const deleteColumn = $((columnId: string) => {
    const currentColumnIndex = formLayout.columns.findIndex(
      (column) => column.id === columnId
    );
    if (currentColumnIndex) {
      const currentColumn = formLayout.columns[currentColumnIndex];

      const previousColumn = formLayout.columns
        .slice(0, currentColumnIndex)
        .filter((column) => column.parentId === currentColumn.parentId)
        .slice(-1)[0];

      decrementChildCount("sections", currentColumn.parentId!);
      formLayout.fields = formLayout.fields.map((field) => {
        if (field.parentId !== currentColumn.id) {
          return field;
        }
        return {
          ...field,
          parentId: previousColumn.id,
        };
      });
      formLayout.columns = [
        ...formLayout.columns.slice(0, currentColumnIndex),
        ...formLayout.columns.slice(currentColumnIndex + 1),
      ];
    }
  });

  const deleteSectionWithColumns = $((sectionId: string) => {
    formLayout.columns = formLayout.columns.filter((column) => {
      if (column.parentId === sectionId) {
        deleteColumnWithFields(column.id);
        return false;
      }
      return true;
    });

    formLayout.sections = formLayout.sections.filter(
      (section) => section.id !== sectionId
    );
  });
  const removeFromIndex = $((arr: any[], index: number): unknown[] => {
    if (index < 0 || index > arr.length - 1) {
      return [...arr];
    }
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
  });
  const deleteSetion = $(async (sectionId: string) => {
    const currentSectionIndex = formLayout.sections.findIndex(
      (section) => sectionId === section.id
    );
    const previousSection = formLayout.sections
      .slice(0, currentSectionIndex)
      .slice(-1)[0];
    formLayout.columns = formLayout.columns.map((column) => {
      if (column.parentId === sectionId) {
        incrementChildCount("sections", previousSection.id);
      }
      return {
        ...column,
        parentId:
          column.parentId === sectionId ? previousSection.id : column.parentId,
      };
    });
    formLayout.sections = (await removeFromIndex(
      formLayout.sections,
      currentSectionIndex
    )) as FormEntity[];
  });

  // movement within container
  const moveColumn = $(
    (columnId: string, sectionId: string, direction: "left" | "right") => {
      const columns = formLayout.columns.filter(
        (column) => column.parentId === sectionId
      );
      const tempIndex = columns.findIndex((column) => column.id === columnId);
      const actualIndex = formLayout.columns.findIndex(
        (column) => column.id === columnId
      );
      const nextColumn = columns[tempIndex + 1];
      const previousColumn = columns[tempIndex - 1];

      if (direction === "right") {
        const nextColumnIndex = formLayout.columns.findIndex(
          (column) => column.id === nextColumn.id
        );
        formLayout.columns[nextColumnIndex] = {
          ...formLayout.columns[actualIndex],
        };
        formLayout.columns[actualIndex] = { ...nextColumn };
      }
      if (direction === "left") {
        const previousColumnIndex = formLayout.columns.findIndex(
          (column) => column.id === previousColumn.id
        );
        formLayout.columns[previousColumnIndex] = {
          ...formLayout.columns[actualIndex],
        };
        formLayout.columns[actualIndex] = { ...previousColumn };
      }
    }
  );

  const moveSection = $((sectionId: string, direction: "up" | "down") => {
    const sectionIndex = formLayout.sections.findIndex(
      (section) => section.id === sectionId
    );
    if (direction === "down") {
      const nextSection = formLayout.sections[sectionIndex + 1];
      formLayout.sections[sectionIndex + 1] = {
        ...formLayout.sections[sectionIndex],
      };
      formLayout.sections[sectionIndex] = { ...nextSection };
    }
    if (direction === "up") {
      const previousSection = formLayout.sections[sectionIndex - 1];
      formLayout.sections[sectionIndex - 1] = {
        ...formLayout.sections[sectionIndex],
      };

      formLayout.sections[sectionIndex] = { ...previousSection };
    }
  });
  return (
    <>
      <div class="vw-100 vh-100">
        <div class="container-fluid">
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
                    moveColumnsToNewSection={moveColumnsToNewSection}
                    duplicateField={duplicateField}
                    deleteColumnWithFields={deleteColumnWithFields}
                    deleteSectionWithColumns={deleteSectionWithColumns}
                    deleteColumn={deleteColumn}
                    deleteSetion={deleteSetion}
                    moveColumn={moveColumn}
                    moveSection={moveSection}
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
