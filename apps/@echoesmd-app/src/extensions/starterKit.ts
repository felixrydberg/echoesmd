import StarterKit from "@tiptap/starter-kit";
import { background, hover } from '@echoesmd/ui'
import { twMerge } from "tailwind-merge";

const classes = twMerge("block", background.container, hover.container)

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
