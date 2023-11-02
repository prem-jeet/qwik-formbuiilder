import type { Signal } from "@builder.io/qwik";
import { component$, useComputed$ } from "@builder.io/qwik";

import type { InputObject } from "~/routes";

interface Props {
  formLayout: Signal<InputObject[]>;
  isPreview: Signal<boolean>;
}

const generateCheckbox = (inputObject: InputObject) => (
  <div class="form-check">
    <input class="form-check-input" type="checkbox" />
    <label class="form-check-label">
      {inputObject.label || <span class="text-muted ">(No label)</span>}
    </label>
  </div>
);
const generateSelect = () => <select class="form-select form-select-lg" />;

const generateTextInput = (inputObject: InputObject) => (
  <input type={inputObject.type} class="form-control" />
);

const generateTextArea = () => <textarea class="form-control" rows={3} />;

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
          <div class="row row-cols-2 rounded-3 border border-2 py-3 mb-1">
            {section.map((column) => (
              <>
                <div class="col  align-self-stretch">
                  <div
                    class={`${
                      !isPreview.value ? "p-3 bg-light" : ""
                    } rounded-3  h-100`}
                  >
                    {column.map((inputObject) => (
                      <div class="mb-3" key={inputObject.id}>
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

                        {/* <small id="helpId" class="form-text text-muted">Help text</small> */}
                      </div>
                    ))}
                  </div>
                </div>
              </>
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
