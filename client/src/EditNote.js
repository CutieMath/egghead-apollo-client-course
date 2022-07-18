import { useParams } from "react-router-dom";

export function EditNote() {
  let { noteId } = useParams();

  return <div>Note {noteId} was selected</div>;
}
