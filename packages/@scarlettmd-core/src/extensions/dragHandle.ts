import DragHandleExtension from "@tiptap-pro/extension-drag-handle";
import { Extension, Editor } from '@tiptap/core';
import { DragHandlePlugin } from "@tiptap-pro/extension-drag-handle";

import tippy from "tippy.js";
const button = [
  "rounded",
  "bg-neutral-200",
  "dark:bg-neutral-900",
  "text-neutral-950",
  "dark:text-neutral-100",
  "h-8",
  "px-[3px]",
  "w-fit",
  "flex",
  "justify-center",
  "items-center",
];

const createDragContainerContent = () => {
  const container = document.createElement("div");

  return container;
}

// const extension = DragHandleExtension.extend({
const extension = Extension.create({
  addOptions() {
    return {
      onNodeChange: (...args) => {
        // console.log("Node changed", args);
      },
      render: (editor: Editor) => {
        const div = document.createElement("div");
        const plus = document.createElement("button");
        const drag = document.createElement("button");
        const plusContainer = document.createElement("div");
        const dragContainer = createDragContainerContent();
        const plusP = document.createElement("p");

        div.classList.add("flex", "gap-x-1", "h-10", "items-center");
        plus.classList.add(...button);
        drag.classList.add(...button);
        plusContainer.classList.add("bg-neutral-200", "dark:bg-neutral-900", "text-neutral-950", "dark:text-neutral-100", "shadow-lg", "dark:shadow-none", "p-[3px]", "rounded",);
        dragContainer.classList.add("bg-neutral-200", "dark:bg-neutral-900", "text-neutral-950", "dark:text-neutral-100", "shadow-lg", "dark:shadow-none", "p-2", "rounded");
        plusP.classList.add("text-xs", "font-semibold", "p-0", "m-0");

        plus.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" /></svg>`;
        drag.innerHTML = ``;
        plusP.innerText = "Add a new block";
        plusContainer.appendChild(plusP);

        const plusTippy = tippy(plus, {
          content: plusContainer,
          placement: "top",
          allowHTML: true,
        });
        const dragTippy = tippy(drag, {
          content: dragContainer,
          placement: "right-start",
          trigger: "click",
          allowHTML: true,
        });

        div.appendChild(plus);
        div.appendChild(drag);

        plus.addEventListener("click", () => {
          console.log(editor)
          console.log(editor.state);
          editor
            .chain()
            .command(({ tr, dispatch }) => {
              console.log(tr)
              if (!dispatch) {
                return false;
              }
              

              return true;
            })
        });

        return div;
      }
    }
  },
  addCommands() {
    return {
      ...this.parent?.(),
    };
  },
  addProseMirrorPlugins() {
    const tippy = this.options.render(this.editor);
    return [DragHandlePlugin({ tippyOptions: this.options.tippyOptions, element: tippy, editor: this.editor, onNodeChange: this.options.onNodeChange })];

  },
});

export default extension;
