"use client"

import { useEffect, useRef, useState } from "react"
import { CKEditor as CKEditorComponent } from "@ckeditor/ckeditor5-react"
import { ClassicEditor, Essentials, Paragraph, Bold, Italic, Heading, List, Link, BlockQuote, Table, Undo } from "ckeditor5"

interface CKEditorProps {
  data?: string
  onChange?: (data: string) => void
}

export default function CKEditor({ data = "", onChange }: CKEditorProps) {
  const [editor, setEditor] = useState<ClassicEditor | null>(null)

  return (
    <div className="min-h-[400px]">
      <CKEditorComponent
        editor={ClassicEditor}
        config={{
          plugins: [
            Essentials,
            Paragraph,
            Bold,
            Italic,
            Heading,
            List,
            Link,
            BlockQuote,
            Table,
            Undo,
          ],
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "blockQuote",
              "insertTable",
              "|",
              "undo",
              "redo",
            ],
          },
          language: "ko",
        }}
        data={data}
        onReady={(editor) => {
          setEditor(editor)
        }}
        onChange={(event, editor) => {
          const editorData = editor.getData()
          onChange?.(editorData)
        }}
      />
    </div>
  )
}

