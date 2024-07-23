import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";

export const commands = [
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    // icon: <Text size={18} />,
    command: ({ editor, range }) => {
      console.log(editor, range);
      // editor
      //   .chain()
      //   .focus()
      //   .deleteRange(range)
      //   .toggleNode("paragraph", "paragraph")
      //   .run();
    },
  },
]

export const slashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }) => {
          console.log("command", { editor, range, props });
          props.command({ editor, range });
        },
      } as SuggestionOptions,
      render: () => {
        return document.createElement("div");
      }
    };
  },
  addProseMirrorPlugins() {
    const element = this.options.render();
    return [
      Suggestion({
        editor: this.editor,
        element: element,
        ...this.options.suggestion,
      }),
    ];
  },
  render() {
    console.log('rendering slash command extension')
  }
});

console.log(slashCommand)
