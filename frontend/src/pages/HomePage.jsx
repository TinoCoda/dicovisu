import React, { useEffect, useState } from 'react';
import { VStack, Select as ChakraSelect, Text } from '@chakra-ui/react';
import { baseStore } from '../store/global';

import { useWordStore } from '../store/words';
import { useLanguageStore } from '../store/languages';
import { useAuthStore } from '../store/authStore';
import { useCountryStore } from '../store/countries';

import SearchBar from '../components/SearchBar';
import SearchResult from '../components/SearchResult';

console.log("load HomePage.jsx");
//console.log("baseStore", baseStore.getState());

const HomePage = () => {
  console.log("load HomePage");
  const { fetchWords, addOfflineWords, words, searchWord, setSelectedWord,
          wrappedWords, setWrappedWords, wrappedSearchResults, setWrappedSearchResults
   } = useWordStore();

   const { login,logout,refresh, isAuthenticated,token } = useAuthStore();
   const { fetchCountries } = useCountryStore();


   
  const { languages, fetchLanguages } = useLanguageStore();
  const [searchResults, setSearchResults] = useState({ directMatches: [], exampleMatches: [], query: "" });
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [entriesCount, setEntriesCount] = useState(0);


 

  useEffect(() => {
    refresh(); // Always refresh auth token

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

  console.log("countries", useCountryStore.getState().countries);
 
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
    const responseObject = await searchWord(query.trim(), selectedLanguage);
    if (!responseObject?.success) {
      console.error("Search failed:", responseObject?.message);
      return;
    }
    const { directMatches = [], exampleMatches = [] } = responseObject;
    setSearchResults({ directMatches, exampleMatches, query: query.trim() });
    setEntriesCount(directMatches.length + exampleMatches.length);
  };

  const handleSelect = (word) => {
    console.log("Selected word:", word);
    setSelectedWord(word);
  };

  const handleLanguageChange = (e) => {
    const languageCode = e.target.value;
    console.log("current Language:", baseStore.getState().language);
    baseStore.getState().setLanguage(languageCode);
    console.log(" Language after selection:", baseStore.getState().language);
    

    setSelectedLanguage(languageCode); 
    const filteredWords = words.filter((word) => word.language.includes(languageCode));
    if(filteredWords.length>0){
      setEntriesCount(filteredWords.length);
    }else{
      setEntriesCount(0);

    }

  };

  return (
    <>
    
      <VStack spacing={4}>
  
        {/* Language Filter Dropdown */}
        <ChakraSelect
          placeholder="Sâla Mbembu"
          onChange={handleLanguageChange}
          value={selectedLanguage}
          maxW="sm"
          w="full"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </ChakraSelect>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        <Text fontSize={{ base: "12", sm: "14" }}
          fontWeight={"bold"}
          textAlign={"center"}
        >
          {(searchResults.directMatches.length > 0 || searchResults.exampleMatches.length > 0)
            ? `${entriesCount} result(s) found`
            : entriesCount > 0
              ? `Total entries: ${entriesCount}`
              : ""}
        </Text>

        {/* Search Results */}
        <SearchResult
          directMatches={searchResults.directMatches}
          exampleMatches={searchResults.exampleMatches}
          query={searchResults.query}
          allWords={words}
          onSelect={handleSelect}
        />

      
      </VStack>
      
    </>
  );
};

export default HomePage;