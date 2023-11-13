import type { QRL, QwikMouseEvent, Signal } from "@builder.io/qwik";
import { $, component$, useOn, useSignal, useStyles$ } from "@builder.io/qwik";

import type { FormEntity, FormLayout } from "~/routes";
import FormFieldDisplay from "./formFieldDisplay";
import Modal from "../modals/modal";
import Tooltip from "../tooltip";

interface Props {
  formLayout: FormLayout;
  isPreview: Signal<boolean>;
  selectedColmnId: Signal<string>;
  selectedSectionId: Signal<string>;
  selectedFieldId: Signal<string>;
  addColumnAfter: QRL<(columnId: string) => {}>;
  addSectionAfter: QRL<(sectionId: string) => {}>;
  removeField: QRL<(fieldId: string) => {}>;
  duplicateField: QRL<(fieldId: string) => {}>;
  moveFieldsToNewColumn: QRL<(fieldId: string) => {}>;
  deleteColumnWithFields: QRL<(columnId: string) => {}>;
  deleteSectionWithColumns: QRL<(columnId: string) => {}>;
}

export default component$<Props>(
  ({
    formLayout,
    isPreview,
    addColumnAfter,
    addSectionAfter,
    selectedColmnId,
    selectedSectionId,
    selectedFieldId,
    removeField,
    duplicateField,
    moveFieldsToNewColumn,
    deleteColumnWithFields,
    deleteSectionWithColumns,
  }) => {
    useStyles$(`.hover-outline:hover{
    outline: 1px solid black;
  }
  .formbuilder_section{
    min-height: 100px;
  }
  .selected_column{
    background: hsl(210,16.7%,95.6%);
    outline: 1px solid black;
  }
  .selected_section{
    outline: 1px solid black;
  }`);

    const hoveringOn = useSignal("");

    useOn(
      "mousemove",
      $((event) => {
        if (isPreview.value) return;
        const target = event.target as HTMLElement;

        if ([...target.classList].includes("formbuilder_section")) {
          hoveringOn.value = "section";
        }
        if ([...target.classList].includes("formbuilder_column")) {
          hoveringOn.value = "column";
        }
      })
    );

    const filterById = (array: FormEntity[], id: string) =>
      array.filter(({ parentId }) => parentId === id);

    const clearSelections = $((e: QwikMouseEvent) => {
      e.stopPropagation();
      selectedColmnId.value = "";
      selectedSectionId.value = "";
      selectedFieldId.value = "";
    });

    return (
      <>
        {formLayout.sections.map(async (section) => (
          <section
            role="button"
            class={`
            ${
              selectedSectionId.value === section.id &&
              !isPreview.value &&
              "selected_section "
            } 
            ${
              hoveringOn.value === "section" &&
              !isPreview.value &&
              "hover-outline "
            }
            row rounded-3 border border-2 py-3 mb-2 formbuilder_section`}
            key={section.id}
            onClick$={async (e) => {
              await clearSelections(e);
              selectedSectionId.value = section.id;
            }}
          >
            {selectedSectionId.value === section.id && !isPreview.value ? (
              <div class="d-flex mb-2 px-3">
                <div class="col text-muted">
                  {section.label || "(no label)"}
                </div>
                <div class="col-auto">
                  <button
                    class="btn btn-outline-dark btn-sm rounded-2 p-0 px-1"
                    onClick$={() => addSectionAfter(section.id)}
                  >
                    <i class="bi bi-plus" />
                  </button>
                  {formLayout.sections.length > 1 && (
                    <span class="ms-2">
                      <Modal
                        triggerBIcon="x"
                        triggerClass="btn-outline-dark btn-sm rounded-2 p-0 px-1"
                        id="delete-section"
                        headerText="Delete Section"
                        escapeClose
                        bodyText="Are you sure you want to delete the Section? All the fields and  columns will be moved to the previous column"
                      >
                        <div q:slot="footer">
                          <button
                            class="btn btn-secondary btn-sm"
                            onClick$={() =>
                              deleteSectionWithColumns(section.id)
                            }
                          >
                            Delete entire section with columns
                          </button>
                          <button class="ms-2 btn btn-dark btn-sm">
                            Delete section
                          </button>
                        </div>
                      </Modal>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              section.label && <h3 class="mb-2 px-3">{section.label}</h3>
            )}
            {filterById(formLayout.columns, section.id).map(
              (column, columnIndex) => (
                <div
                  class={`${
                    section.childCount! > 1 ? "col" : "col-6"
                  } align-self-stretch formbuilder_section`}
                  key={column.id}
                  role="button"
                >
                  <div
                    class={`
                  rounded-3   h-100  formbuilder_column
                  ${!isPreview.value && "p-3 bg-light"}
                  ${
                    hoveringOn.value === "column" &&
                    !isPreview.value &&
                    "hover-outline "
                  }
                  ${
                    selectedColmnId.value === column.id &&
                    !isPreview.value &&
                    "selected_column"
                  }`}
                    onClick$={async (e) => {
                      await clearSelections(e);
                      selectedColmnId.value = column.id;
                    }}
                  >
                    <div class="row align-items-center">
                      {selectedColmnId.value === column.id &&
                      !isPreview.value ? (
                        <>
                          <div class="text-muted col">
                            {column.label || "(no label)"}
                          </div>
                          <div class="col-auto">
                            {columnIndex > 0 && (
                              <Tooltip title="Move current column and following columns to new section">
                                <button class="btn btn-outline-dark btn-sm rounded-2 p-0 px-1">
                                  <i class="bi bi-box-arrow-in-up-right" />
                                </button>
                              </Tooltip>
                            )}
                            <button
                              class="btn btn-outline-dark btn-sm rounded-2 ms-2 p-0 px-1"
                              onClick$={() => addColumnAfter(column.id)}
                            >
                              <i class="bi bi-plus" />
                            </button>
                            {section.childCount! > 1 && (
                              <span class="ms-2">
                                <Modal
                                  triggerBIcon="x"
                                  triggerClass="btn-outline-dark btn-sm rounded-2 p-0 px-1"
                                  id="delete-column"
                                  headerText="Delete column"
                                  escapeClose
                                  bodyText="Are you sure you want to delete the column? All the fields in the column will be moved to the previous column"
                                >
                                  <div q:slot="footer">
                                    <button
                                      class="btn btn-secondary btn-sm"
                                      onClick$={() =>
                                        deleteColumnWithFields(column.id)
                                      }
                                    >
                                      Delete entire column with fields
                                    </button>
                                    <button class="ms-2 btn btn-dark btn-sm">
                                      Delete column
                                    </button>
                                  </div>
                                </Modal>
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        column.label && (
                          <div class="text-muted col">{column.label}</div>
                        )
                      )}
                    </div>
                    {filterById(formLayout.fields, column.id).map(
                      (field, index) => (
                        <div
                          role="button"
                          class={`
                      ${
                        selectedFieldId.value === field.id &&
                        !isPreview.value &&
                        "selected_field"
                      } 
                     
                      mt-1  formBuilder_inputField p-2 rounded-3`}
                          key={field.id}
                          onClick$={async (e) => {
                            await clearSelections(e);
                            selectedFieldId.value = field.id;
                          }}
                        >
                          <FormFieldDisplay
                            fieldEntity={field}
                            selectedFieldId={selectedFieldId}
                            removeField={removeField}
                            moveFieldsToNewColumn={moveFieldsToNewColumn}
                            shouldAllowDetach={index > 0}
                            isPreview={isPreview}
                            duplicateField={duplicateField}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </section>
        ))}

        {isPreview.value && (
          <div class="row justify-content-end mt-4">
            <div class="col-auto">
              <button class="btn btn-primary btn-lg">Submit</button>
            </div>
            <div class="col-auto">
              <button class="btn btn-danger btn-lg">clear</button>
            </div>
          </div>
        )}
      </>
    );
  }
);
