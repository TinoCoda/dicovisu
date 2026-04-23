import { useState, useEffect, useRef } from "react";
import { Input, Button, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";

const DEBOUNCE_MS = 350;

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const timerRef = useRef(null);

  // Debounced search: only fires after the user stops typing for DEBOUNCE_MS
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const handleType = (e) => setQuery(e.target.value);

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (onSearch) onSearch(query);
  };

  return (
    <VStack spacing={4} width="100%" maxW="md">
      <InputGroup>
        <Input
          placeholder="tomb' liambu..."
          value={query}
          onChange={handleType}
        />
        <InputRightElement width="4.5rem">
          <Button colorScheme="blue" onClick={handleClick}>
            Tomb'
          </Button>
        </InputRightElement>
      </InputGroup>
    </VStack>
  );
}

export default SearchBar;
