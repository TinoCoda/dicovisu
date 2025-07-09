import { Box, List, ListItem, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { baseStore } from "../store/global";

const SearchResult = ({ results, onSelect }) => {
  if (!results || results.length === 0) {
    return null;
  }
  const language = baseStore.getState().language;
  let filteredResults = results;
  if (language) {
    filteredResults = results.filter((result) => result.language.includes(language));
    if (filteredResults.length === 0) {
      return (
        <Box mt={2} w="full" bg="white" boxShadow="md" borderRadius="md" p={2}>
          <Text fontSize="md" color="gray.500">
            No results found for the selected language.
          </Text>
        </Box>
      );
    }
  }

  return (
    <Box
      mt={2}
      w="full"
      bg="white"
      boxShadow="md"
      borderRadius="md"
      p={2}
      maxH="400px"
      maxW={{ base: "500px", md: "800px" }}
      overflowY="auto"
    >
      <List spacing={2}>
        {filteredResults.map((result) => (
          <ListItem
            key={result?result.id:""}
            p={2}
            borderRadius="md"
            _hover={{ bg: "gray.100", cursor: "pointer" }}
            onClick={() => onSelect(result)}
          >
            <Link to={`/details`}>
              <Text fontSize="md" fontWeight={"medium"} color={"black"}>
                {result?result.word:""}
              </Text>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SearchResult;
