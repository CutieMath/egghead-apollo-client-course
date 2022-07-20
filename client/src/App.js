import { UiAppLayout } from "./shared-ui/UiAppLayout";
import { Stack } from "@chakra-ui/react";
import { NoteList } from "./NoteList";
import { SelectCategory } from "./SelectCategory";
import { useState } from "react";
import { EditNote } from "./EditNote";
import { Route } from "react-router-dom";
import { EditCategories } from "./EditCategories";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("1");
  return (
    <UiAppLayout>
      <Stack width={400}>
        <SelectCategory
          defaultCategory={selectedCategory}
          onCategoryChange={(category) => setSelectedCategory(category)}
        />
        <EditCategories />
        <NoteList category={selectedCategory} />
      </Stack>
      <Route path={`/note/:noteId`}>
        <EditNote />
      </Route>
    </UiAppLayout>
  );
}

export default App;
