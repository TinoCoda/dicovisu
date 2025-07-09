import { useState } from "react";
import { Input, Button, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = (searchQuery) => {
    if (onSearch) {
      console.log("Search query:", searchQuery);
      onSearch(searchQuery); // Use the passed value directly
    }
  };

  const handleType = (e) => {
    const newQuery = e.target.value; // Get the current input value
    setQuery(newQuery); // Update the state
    handleSearch(newQuery); // Pass the current value to handleSearch
  };

  return (
    <VStack spacing={4} width="100%" maxW="md">
      <InputGroup>
        <Input
          placeholder="Search for a word..."
          value={query}
          onChange={handleType} // Call handleType on input change
        />
        <InputRightElement width="4.5rem">
          <Button colorScheme="blue" onClick={() => handleSearch(query)}>
            Search
          </Button>
        </InputRightElement>
      </InputGroup>
    </VStack>
  );
}

export default SearchBar;
