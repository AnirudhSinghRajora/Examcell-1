import { Suspense } from "react"
import MarksTableClient from "./MarksTableClient"

export default function TeacherMarksPage() {
  return (
    <Suspense fallback={<div>Loading marks...</div>}>
      <MarksTableClient />
    </Suspense>
  )
}
