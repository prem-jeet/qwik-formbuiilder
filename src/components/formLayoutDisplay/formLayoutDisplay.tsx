import type { Signal } from "@builder.io/qwik";
import {
  $,
  component$,
  useComputed$,
  useOn,
  useSignal,
  useStyles$,
} from "@builder.io/qwik";

import type { InputObject } from "~/routes";

interface Props {
  formLayout: Signal<InputObject[]>;
  isPreview: Signal<boolean>;
  editingFieldId: Signal<string>;
}

const generateCheckbox = (inputObject: InputObject) => (
  <div class="form-check">
    <input class="form-check-input" type="checkbox" disabled />
    <label class="form-check-label">
      {inputObject.label || <span class="text-muted ">(No label)</span>}
    </label>
  </div>
);
const generateSelect = () => (
  <select class="form-select form-select-lg" disabled />
);

const generateTextInput = (inputObject: InputObject) => (
  <input type={inputObject.type} class="form-control" disabled />
);

const generateTextArea = () => (
  <textarea class="form-control" rows={3} disabled />
);

const divideLayout = (
  layout: InputObject[],
  parameter: "section" | "column"
) => {
  let stack: InputObject[] = [];
  const sectionLayout: InputObject[][] = [];

  for (let i = 0; i < layout.length; i++) {
    if (layout[i].type !== parameter) {
      stack.push({ ...layout[i] });
    } else {
      sectionLayout.push([...stack]);
      stack = [];
    }

    if (i === layout.length - 1 && stack.length > 0) {
      sectionLayout.push([...stack]);
      stack = [];
    }
  }
  return sectionLayout;
};

export default component$<Props>(({ formLayout, isPreview }) => {
  useStyles$(`.hover-outline:hover{
    outline: 1px solid black;
  }`);

  const hoveringOn = useSignal("");

  useOn(
    "mousemove",
    $((event) => {
      const target = event.target as HTMLElement;

      if ([...target.classList].includes("formbuilder_section")) {
        hoveringOn.value = "section";
      }
      if ([...target.classList].includes("formbuilder_column")) {
        hoveringOn.value = "column";
      }
      if ([...target.classList].includes("formBuilder_inputField")) {
        hoveringOn.value = "field";
      }

      // No manual clean up required!
    })
  );
  const finalFormLayout = useComputed$(async () => {
    const sectionLayout = await divideLayout(formLayout.value, "section");
    const finalLayout: InputObject[][][] = [];
    sectionLayout.forEach(async (item) => {
      const columnDivision = await divideLayout(item, "column");

      finalLayout.push([...columnDivision]);
    });
    return finalLayout;
  });
  return (
    <>
      {finalFormLayout.value.map((section) => (
        <>
          {/* section */}
          <div
            class={`
            ${
              hoveringOn.value === "section" && "hover-outline"
            } row row-cols-2  rounded-3 border border-2 py-3 mb-1 formbuilder_section`}
            role="button"
          >
            {/* column */}
            {section.map((column, index) => (
              <div
                key={index}
                class="col align-self-stretch  formbuilder_section"
              >
                <div
                  class={`${!isPreview.value && " p-3 bg-light"} ${
                    hoveringOn.value === "column" && "hover-outline"
                  } rounded-3  h-100  formbuilder_column`}
                >
                  {/* input field */}
                  {column.map((inputObject) => (
                    <div
                      class={`${
                        hoveringOn.value === "field" && "hover-outline"
                      } mb-3 p-2 rounded-3 formBuilder_inputField`}
                      role="button"
                      key={inputObject.id}
                    >
                      {inputObject.type === "checkbox" ? (
                        generateCheckbox(inputObject)
                      ) : (
                        <>
                          <label class="form-label">
                            {inputObject.label || (
                              <span class="text-muted ">(No label)</span>
                            )}
                          </label>

                          {inputObject.type === "select"
                            ? generateSelect()
                            : inputObject.type === "long-text"
                            ? generateTextArea()
                            : generateTextInput(inputObject)}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ))}
      {isPreview.value && formLayout.value.length ? (
        <div class="row justify-content-end mt-4">
          <div class="col-auto">
            <button class="btn btn-primary btn-lg">Submit</button>
          </div>
          <div class="col-auto">
            <button class="btn btn-danger btn-lg">clear</button>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
});
