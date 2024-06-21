import StarterKit from "@tiptap/starter-kit";

const classes = "block text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800"

export default StarterKit.configure({
  heading: {
    levels: [1, 2, 3],
    HTMLAttributes: {
      class: classes,
    }
  },
  bulletList: {
    HTMLAttributes: {
      class: classes,
    }
  },
  orderedList: {
    HTMLAttributes: {
      class: classes,
    }
  },
  listItem: {
    HTMLAttributes: {
      class: classes,
    }
  },
  codeBlock: {
    HTMLAttributes: {
      class: classes,
    }
  },  
  code: {
    HTMLAttributes: {
      class: classes,
    }
  },
  blockquote: {
    HTMLAttributes: {
      class: classes,
    }
  },
  hardBreak: {
    HTMLAttributes: {
      class: classes,
    }
  },
  paragraph: {
    HTMLAttributes: {
      class: classes,
    }
  },
  history: false,
});
