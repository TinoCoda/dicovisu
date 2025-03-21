import { Box, List, ListItem, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const SearchResult = ({ results, onSelect }) => {
  if (!results || results.length === 0) {
    return null;
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
        {results.map((result) => (
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
