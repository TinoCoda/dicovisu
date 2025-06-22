import React, { useEffect, useState } from 'react';
import { VStack, Select as ChakraSelect } from '@chakra-ui/react';
import { baseStore } from '../store/global';

import { useWordStore } from '../store/words';
import { useLanguageStore } from '../store/languages';
import {useAuthStore} from '../store/authStore';
import { useCountryStore } from '../store/countries';

import SearchBar from '../components/SearchBar';
import SearchResult from '../components/SearchResult';

console.log("load HomePage.jsx");
console.log("baseStore", baseStore.getState());

const HomePage = () => {
  console.log("load HomePage");
  const { fetchWords, addOfflineWords, words, searchWord, setSelectedWord,
          wrappedWords, setWrappedWords, wrappedSearchResults, setWrappedSearchResults
   } = useWordStore();

   const { login,logout,refresh, isAuthenticated,token } = useAuthStore();
   const { fetchCountries } = useCountryStore();


   
  const { languages, fetchLanguages } = useLanguageStore();
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");

 

  useEffect(() => {
    login("tinotech", "dev-me")

    refresh(); // Refresh authentication status

  
    fetchWords();
    addOfflineWords();
    fetchLanguages(); // Fetch available languages
    fetchCountries(); // Fetch available countries
    //setWrappedWords(words);
    //setWrappedSearchResults(words);
  }, [fetchWords, addOfflineWords, fetchLanguages, login, refresh,fetchCountries]);

  console.log("countries", useCountryStore.getState().countries);
 
  const handleSearch = async (query) => {
    console.log("Searching for:", query);
    const responseObject = await searchWord(query, selectedLanguage); // Pass selected language code
    console.log("response:", responseObject);
    const result = responseObject.data;
    console.log("success:", responseObject.success);
    console.log("message:", responseObject.message);

    setSearchResults(result);
    //setWrappedSearchResults(result);
  };

  const handleSelect = (word) => {
    console.log("Selected word:", word);
    setSelectedWord(word);
  };

  const handleLanguageChange = (e) => {
    const languageCode = e.target.value;
    setSelectedLanguage(languageCode);
    console.log("Selected language code:", languageCode);

    const filteredWords = words.filter((word) => word.language === languageCode);
    //setWrappedWords(filteredWords);
    const filteredSearchResults = searchResults.filter((word) => word.language === languageCode);
    //setWrappedSearchResults(filteredSearchResults);
  };

  return (
    <>
    
      <VStack spacing={4}>
        
      
        {/* Language Filter Dropdown */}
        <ChakraSelect
          placeholder="Select Language"
          onChange={handleLanguageChange}
          value={selectedLanguage}
          width={"12%"}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </ChakraSelect>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Search Results */}
        <SearchResult results={searchResults.length > 0 ? searchResults : words} onSelect={handleSelect} />
      </VStack>
    </>
  );
};

export default HomePage;