import { useState, useEffect, useRef } from "react";
import { Input, Button, InputGroup, InputLeftElement, InputRightElement, VStack } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

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
      <InputGroup size="lg">
        <InputLeftElement pointerEvents="none" color="text-muted">
          <LuSearch />
        </InputLeftElement>
        <Input
          placeholder="tomb' liambu..."
          value={query}
          onChange={handleType}
          bg="bg-surface"
          borderColor="border-default"
          _hover={{ borderColor: "blue.300" }}
          pr="6rem"
        />
        <InputRightElement width="5.5rem" pr={1}>
          <Button colorScheme="blue" size="sm" onClick={handleClick}>
            Tomb'
          </Button>
        </InputRightElement>
      </InputGroup>
    </VStack>
  );
}

export default SearchBar;
