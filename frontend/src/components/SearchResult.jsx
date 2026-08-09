import {
  Box,
  List,
  ListItem,
  Text,
  HStack,
  VStack,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useWordStore } from "../store/words";
import { Icon } from "@chakra-ui/react";
import { MdOutlineSpellcheck } from "react-icons/md";
import { FaVolumeUp } from "react-icons/fa";

// ─── Helper: highlight occurrences of `query` inside `text` ────────────────
function HighlightedText({ text, query, fontSize = "sm", color = "text-muted" }) {
  if (!text || !query) return <Text fontSize={fontSize} color={color}>{text}</Text>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <Text fontSize={fontSize} color={color} noOfLines={3}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Box
            key={i}
            as="mark"
            bg="teal.200"
            color="gray.900"
            borderRadius="sm"
            px="1px"
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </Text>
  );
}

// ─── A single result row ────────────────────────────────────────────────────
function ResultRow({ word, query, showExampleSnippet, onSelect }) {
  const navigate = useNavigate();

  const handleClick = () => {
    onSelect(word);
    navigate("/details");
  };

  const snippet = showExampleSnippet
    ? word.example || word.description
    : null;

  // Build the right-side label: translations take priority, else meaning
  const rightLabel = word.translations?.length > 0
    ? word.translations.join(", ")
    : word.meaning;

  return (
    <ListItem
      p={0}
      borderBottom="1px solid"
      borderColor="border-default"
      _hover={{ bg: "bg-surface-raised", cursor: "pointer" }}
      onClick={handleClick}
      transition="background 0.15s"
    >
      <HStack spacing={0} align="stretch" minH="40px">
        {/* Left column — native word */}
        <Box
          flex="1"
          px={3}
          py={2}
          borderRight="1px solid"
          borderColor="border-default"
          display="flex"
          alignItems="center"
        >
          <HStack spacing={2}>
            <Text fontFamily="heading" fontSize="sm" fontWeight="600" color="blue.400" noOfLines={1}>
              {query
                ? <HighlightedText text={word.word} query={query} fontSize="sm" color="blue.400" />
                : word.word
              }
            </Text>
            {word.audio?.filename && (
              <Icon as={FaVolumeUp} color="teal.500" boxSize={3} />
            )}
          </HStack>
        </Box>
        {/* Right column — meaning / translation */}
        <Box flex="1" px={3} py={2} display="flex" flexDir="column" justifyContent="center">
          <Text fontSize="sm" color="text-muted" noOfLines={1}>
            {query
              ? <HighlightedText text={rightLabel} query={query} fontSize="sm" color="text-muted" />
              : rightLabel
            }
          </Text>
          {/* Example snippet when searching */}
          {snippet && (
            <Box mt={1} pl={2} borderLeft="3px solid" borderColor="teal.400">
              <HighlightedText text={snippet} query={query} fontSize="xs" color="text-muted" />
            </Box>
          )}
        </Box>
      </HStack>
    </ListItem>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
const SearchResult = ({ directMatches = [], exampleMatches = [], query = "", allWords = [], onSelect }) => {
  const { setSelectedWord } = useWordStore();

  const handleSelect = (word) => {
    setSelectedWord(word);
    if (onSelect) onSelect(word);
  };

  // ── No query yet: show the full word list ──────────────────────────────
  if (!query) {
    if (!allWords || allWords.length === 0) return null;
    return (
      <Box
        mt={2} w="full" bg="bg-surface" boxShadow="md" borderRadius="lg"
        border="1px solid" borderColor="border-default"
        maxH="450px" maxW={{ base: "500px", md: "800px" }}
        overflowY="scroll"   // always reserve scrollbar gutter so header + rows share same width
      >
        {/* Column headers — inside the scroll container so they align perfectly with rows */}
        <HStack
          spacing={0}
          bg="bg-surface-raised"
          borderBottom="2px solid"
          borderColor="border-default"
          position="sticky"
          top={0}
          zIndex={1}
        >
          <Box flex="1" px={3} py={2} borderRight="1px solid" borderColor="border-default">
            <Text fontSize="xs" fontWeight="bold" color="text-muted" textTransform="uppercase" letterSpacing="wide">
              Word
            </Text>
          </Box>
          <Box flex="1" px={3} py={2}>
            <Text fontSize="xs" fontWeight="bold" color="text-muted" textTransform="uppercase" letterSpacing="wide">
              Meaning / Translation
            </Text>
          </Box>
        </HStack>
        <List spacing={0}>
          {allWords.map((word) => (
            <ResultRow key={word._id} word={word} query="" showExampleSnippet={false} onSelect={handleSelect} />
          ))}
        </List>
      </Box>
    );
  }

  const hasDirectMatches = directMatches.length > 0;
  const hasExampleMatches = exampleMatches.length > 0;

  // ── Nothing at all ─────────────────────────────────────────────────────
  if (!hasDirectMatches && !hasExampleMatches) {
    return (
      <Box
        mt={2} w="full" bg="bg-surface" boxShadow="md" borderRadius="lg" p={5}
        border="1px solid" borderColor="border-default"
        maxW={{ base: "500px", md: "800px" }} textAlign="center"
      >
        <Text fontSize="2xl" mb={2}>🔍</Text>
        <Text fontSize="md" fontWeight="semibold" color="text-primary">
          No results found for "{query}"
        </Text>
        <Text fontSize="sm" color="text-muted" mt={1}>
          Try a different spelling or a shorter fragment.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      mt={2} w="full" bg="bg-surface" boxShadow="md" borderRadius="lg"
      border="1px solid" borderColor="border-default"
      maxH="520px" maxW={{ base: "500px", md: "800px" }} overflowY="auto"
    >
      {/* ── Section 1: Direct matches ──────────────────────────────────── */}
      {hasDirectMatches && (
        <>
          <Box px={4} pt={3} pb={1}>
            <HStack spacing={2} align="center">
              <Icon as={MdOutlineSpellcheck} color="blue.400" boxSize={4} />
              <Text fontSize="xs" fontWeight="bold" color="blue.400" textTransform="uppercase" letterSpacing="wide">
                Direct matches
              </Text>
              <Badge colorScheme="blue" borderRadius="full">{directMatches.length}</Badge>
            </HStack>
          </Box>
          <List spacing={0} px={2} pb={2}>
            {directMatches.map((word) => (
              <ResultRow key={word._id} word={word} query={query} showExampleSnippet={false} onSelect={handleSelect} />
            ))}
          </List>
        </>
      )}

      {/* ── Divider + Section 2: Example matches ──────────────────────── */}
      {hasExampleMatches && (
        <>
          {hasDirectMatches && <Divider borderColor="border-default" />}
          <Box px={4} pt={3} pb={1}>
            <HStack spacing={2} align="center">
              <Text fontSize="xs" fontWeight="bold" color="teal.400" textTransform="uppercase" letterSpacing="wide">
                {hasDirectMatches
                  ? "📖 Also found in examples of"
                  : "🔎 No perfect match — found in examples of"}
              </Text>
              <Badge colorScheme="teal" borderRadius="full">{exampleMatches.length}</Badge>
            </HStack>
            {!hasDirectMatches && (
              <Text fontSize="xs" color="text-muted" mt={1}>
                <Box as="strong" color="text-primary">"{query}"</Box> doesn't have its own entry, but it appears in the examples or descriptions below. Click any word to explore.
              </Text>
            )}
          </Box>
          <List spacing={0} px={2} pb={3}>
            {exampleMatches.map((word) => (
              <ResultRow key={word._id} word={word} query={query} showExampleSnippet={true} onSelect={handleSelect} />
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

export default SearchResult;
