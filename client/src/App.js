import { UiAppLayout } from "./shared-ui/UiAppLayout";
import { Stack } from "@chakra-ui/react";
import { NoteList } from "./NoteList";
import { SelectCategory } from "./SelectCategory";
import { useState } from "react";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("1");
  return (
    <UiAppLayout>
      <Stack width={400}>
        <SelectCategory
          defaultCategory={selectedCategory}
          onCategoryChange={(category) => setSelectedCategory(category)}
        />
        <NoteList category={selectedCategory} />
      </Stack>
    </UiAppLayout>
  );
}

export default App;
