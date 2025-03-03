import { useState } from "react";
import { Input, Button, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <VStack spacing={4} width="100%" maxW="md">
      <InputGroup>
        <Input
          placeholder="Search for a word..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <InputRightElement width="4.5rem">
          <Button colorScheme="blue" onClick={handleSearch}>
            Search
          </Button>
        </InputRightElement>
      </InputGroup>
    </VStack>
  );
}

export default SearchBar;
