import React, { useEffect, useState } from 'react';
import { VStack, Select as ChakraSelect, Text, Box, Badge } from '@chakra-ui/react';
import { baseStore } from '../store/global';

import { useWordStore } from '../store/words';
import { useLanguageStore } from '../store/languages';
import { useAuthStore } from '../store/authStore';
import { useCountryStore } from '../store/countries';

import SearchBar from '../components/SearchBar';
import SearchResult from '../components/SearchResult';
import { getLemmaSearchTerms } from '../utils/lemmatizer';

const HomePage = () => {
  const { fetchWords, addOfflineWords, words, searchWord, setSelectedWord,
          wrappedWords, setWrappedWords, wrappedSearchResults, setWrappedSearchResults
   } = useWordStore();

   const { login,logout, isAuthenticated,token } = useAuthStore();
   const { fetchCountries } = useCountryStore();


   
  const { languages, fetchLanguages } = useLanguageStore();
  const [searchResults, setSearchResults] = useState({ directMatches: [], exampleMatches: [], query: "" });
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [entriesCount, setEntriesCount] = useState(0);


 

  useEffect(() => {
    // Session bootstrap (refresh from the httpOnly cookie) now happens once at
    // App mount, before this page can even render — no need to repeat it here.

    // Guard every fetch: only hit the API on first load, not on every navigation.
    // Without these guards, every return to "/" re-fetched all data and
    // triggered multiple token-refresh attempts through the interceptor.
    if (words.length === 0) {
      fetchWords();
      addOfflineWords();
    }
    if (languages.length === 0) {
      fetchLanguages();
    }
    if (useCountryStore.getState().countries.length === 0) {
      fetchCountries();
    }
  }, []); // empty deps — all store actions are stable Zustand refs

  const handleSearch = async (query) => {
    if (!query || query.trim() === "") {
      // Empty search: show total count
      setSearchResults({ directMatches: [], exampleMatches: [], query: "" });
      const responseObject = await searchWord("", selectedLanguage);
      if (responseObject?.totalCount !== undefined) {
        setEntriesCount(responseObject.totalCount);
      } else if (selectedLanguage) {
        // Filter by language if selected
        const filteredWords = words.filter((word) => word.language.includes(selectedLanguage));
        setEntriesCount(filteredWords.length);
      } else {
        setEntriesCount(words.length);
      }
      return;
    }
    const { terms } = getLemmaSearchTerms(query.trim());
    const responseObject = await searchWord(terms, selectedLanguage);
    if (!responseObject?.success) {
      console.error("Search failed:", responseObject?.message);
      return;
    }
    const { directMatches = [], exampleMatches = [] } = responseObject;
    setSearchResults({ directMatches, exampleMatches, query: query.trim() });
    setEntriesCount(directMatches.length + exampleMatches.length);
  };

  const handleSelect = (word) => {
    setSelectedWord(word);
  };

  const handleLanguageChange = (e) => {
    const languageCode = e.target.value;
    baseStore.getState().setLanguage(languageCode);

    setSelectedLanguage(languageCode);
    const filteredWords = words.filter((word) => word.language.includes(languageCode));
    if(filteredWords.length>0){
      setEntriesCount(filteredWords.length);
    }else{
      setEntriesCount(0);

    }

  };

  const hasResults = searchResults.directMatches.length > 0 || searchResults.exampleMatches.length > 0;

  return (
    <VStack spacing={6} pt={{ base: 4, md: 10 }}>
      <VStack spacing={1} textAlign="center">
        <Text
          fontFamily="heading"
          fontStyle="italic"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="500"
          color="text-primary"
        >
          Tomba diambu
        </Text>
        <Text fontSize="sm" color="text-muted">
          Search the Kikongo Language Cluster
        </Text>
      </VStack>

      <VStack spacing={4} w="full" align="center">
        {/* Language Filter Dropdown */}
        <ChakraSelect
          placeholder="Sâla Mbembu"
          onChange={handleLanguageChange}
          value={selectedLanguage}
          maxW="sm"
          w="full"
          bg="bg-surface"
          borderColor="border-default"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </ChakraSelect>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {entriesCount > 0 && (
          <Badge
            colorScheme={hasResults ? "blue" : "gray"}
            variant="subtle"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {hasResults ? `${entriesCount} result${entriesCount === 1 ? "" : "s"} found` : `${entriesCount} total entries`}
          </Badge>
        )}

        {/* Search Results */}
        <Box w="full" display="flex" justifyContent="center">
          <SearchResult
            directMatches={searchResults.directMatches}
            exampleMatches={searchResults.exampleMatches}
            query={searchResults.query}
            allWords={words}
            onSelect={handleSelect}
          />
        </Box>
      </VStack>
    </VStack>
  );
};

export default HomePage;