import React, { useEffect, useState } from 'react';
import { VStack, Select as ChakraSelect,Text } from '@chakra-ui/react';
import { baseStore } from '../store/global';

import { useWordStore } from '../store/words';
import { useLanguageStore } from '../store/languages';
import {useAuthStore} from '../store/authStore';
import { useCountryStore } from '../store/countries';

import SearchBar from '../components/SearchBar';
import SearchResult from '../components/SearchResult';
import { fi } from 'date-fns/locale';

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
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [entriesCount, setEntriesCount] = useState(0);


 

  useEffect(() => {
    login("tinotech", "dev-me")

    refresh(); // Refresh authentication status

  
    fetchWords();
    addOfflineWords();
    fetchLanguages(); // Fetch available languages
    fetchCountries(); // Fetch available countries
    setWrappedWords(words);
    setWrappedSearchResults(words);
  }, [fetchWords, addOfflineWords, fetchLanguages, login, refresh,fetchCountries]);

  console.log("countries", useCountryStore.getState().countries);
 
  const handleSearch = async (query) => {
    console.log("Searching for:", query);
    const responseObject = await searchWord(query, selectedLanguage); // Pass selected language code
    console.log("response: search", responseObject);
    const result = responseObject?.data;
    console.log("success:", responseObject.success);
    console.log("message:", responseObject.message);
    if (!responseObject.success) {
      console.error("Search failed:", responseObject.message);
      return;
    }
    setSearchResults(result);
    if (selectedLanguage===""){
    setEntriesCount(result.length);
    }else{
      const filteredWords = result.filter((word) => word.language.includes(selectedLanguage));
      setEntriesCount(filteredWords.length);
    }
    //setWrappedSearchResults(result);
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
    /*
    console.log("Selected language code:", languageCode);

    const filteredWords = words.filter((word) => word.language === languageCode);
    console.log("Selected language Filtered words:", filteredWords);
    setWrappedWords(filteredWords);
    const filteredSearchResults = searchResults.filter((word) => word.language === languageCode);
    console.log("Selected language Filtered search results:", filteredSearchResults);
    setWrappedSearchResults(filteredSearchResults);*/
  };

  return (
    <>
    
      <VStack spacing={4}>
  
        {/* Language Filter Dropdown */}
        <ChakraSelect
          placeholder="Sâla Mbembu"
          onChange={handleLanguageChange}
          value={selectedLanguage}
          width={"65%"}
          p={5}
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
            {searchResults.length > 0 ? `Number of entries: ${entriesCount}`: ""}
        </Text>



        {/* Search Results */}
        <SearchResult results={searchResults.length > 0 ? searchResults : words} onSelect={handleSelect} />

      
      </VStack>
      
    </>
  );
};

export default HomePage;