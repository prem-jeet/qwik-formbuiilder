import type { AvailableInputTypes } from "~/components/available-fields-menu/availableFieldMenu";
import type { DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import AvailableFieldMenu from "~/components/available-fields-menu/availableFieldMenu";

interface InputObject {
  type: AvailableInputTypes;
  label: string | null;
  name: string | null;
  mendatory: boolean;
}

export default component$(() => {
  const formLayout = useSignal<InputObject[]>([]);
  const selectedInputType = useSignal<AvailableInputTypes | null>(null);
  const insertIntoFormLayout = $((type: AvailableInputTypes) => {
    const newInputTypeObject: InputObject = {
      name: null,
      label: null,
      mendatory: false,
      type: type,
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
                <AvailableFieldMenu selectedInput={selectedInputType} />
              </div>
            </div>
            <div class="col">{JSON.stringify(formLayout.value, null, 2)}</div>
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
