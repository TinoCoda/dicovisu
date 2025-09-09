import React, { useState, useEffect } from 'react';
import { Box, Container, Text, VStack, Heading, useColorModeValue, Input, Button, useToast, Textarea } from "@chakra-ui/react";
import Select from 'react-select'; // Import react-select
import { useWordStore } from '../store/words';
import { useLanguageStore } from '../store/languages';
import { useCountryStore } from '../store/countries';

function AddNewEntry() {
  const [newWord, setNewWord] = useState({
    word: "",
    meaning: "",
    language: [], // Updated to an array for multiple languages
    description: "",
    example: "",
  });

  const toast = useToast();
  const { addWord } = useWordStore();
  const { languages, fetchLanguages } = useLanguageStore();
  const { fetchCountries } = useCountryStore();

  useEffect(() => {
    fetchLanguages();
    fetchCountries();
  }, [fetchLanguages, fetchCountries]);

  const handleAddWord = async () => {
    console.log("Submitting new word:", newWord);

    const { success, message } = await addWord(newWord);
    console.log("addWord", success, message);

    if (success) {
      setNewWord({
        word: "",
        meaning: "",
        language: [],
        description: "",
        example: "",
      });

      toast({
        title: "Word added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed to add word",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLanguageChange = (selectedOptions) => {
    // Update the language field with an array of selected language codes
    const selectedLanguages = selectedOptions.map((option) => option.value);
    setNewWord({ ...newWord, language: selectedLanguages });
  };

  // Custom styles for react-select to improve contrast in dark mode
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: useColorModeValue("white", "gray.700"),
      borderColor: state.isFocused ? "teal" : useColorModeValue("gray.300", "gray.600"),
      color: useColorModeValue("black", "white"),
      boxShadow: state.isFocused ? "0 0 0 1px teal" : "none",
      "&:hover": {
        borderColor: "teal",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: useColorModeValue("white", "gray.700"),
      color: useColorModeValue("black", "white"),
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? useColorModeValue("teal.100", "teal.600")
        : useColorModeValue("white", "gray.700"),
      color: state.isFocused ? useColorModeValue("black", "white") : useColorModeValue("black", "white"),
      "&:hover": {
        backgroundColor: useColorModeValue("teal.100", "teal.600"),
        color: useColorModeValue("black", "white"),
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: useColorModeValue("teal.100", "teal.600"),
      color: useColorModeValue("black", "white"),
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: useColorModeValue("black", "white"),
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: useColorModeValue("black", "white"),
      "&:hover": {
        backgroundColor: useColorModeValue("teal.200", "teal.700"),
        color: useColorModeValue("black", "white"),
      },
    }),
  };

  return (
    <>
      <Container maxW={"container.sm"}>
        <VStack spacing={8}>
          <Heading as="h1" size="2xl" textAlign={"center"} mb={8}>
            Add a New Word
          </Heading>
          <Box w={"full"} bg={useColorModeValue("white", "gray.800")} p={6} rounded={"lg"} shadow={"md"}>
            <Text fontSize="xl">Creating a New Entry</Text>
            <VStack spacing={4}>
              <Input
                placeholder="Word"
                name="word"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
              />
              <Input
                placeholder="Meaning"
                name="meaning"
                value={newWord.meaning}
                onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
              />
              <Select
                isMulti // Enable multi-select
                options={languages.map((language) => ({
                  value: language.code,
                  label: language.name,
                }))}
                placeholder="Select Languages"
                onChange={handleLanguageChange} // Handle language selection
                value={newWord.language.map((code) => ({
                  value: code,
                  label: languages.find((lang) => lang.code === code)?.name || code,
                }))}
                styles={customStyles} // Apply custom styles
              />
              <Textarea
                placeholder="Description"
                name="description"
                value={newWord.description}
                onChange={(e) => setNewWord({ ...newWord, description: e.target.value })}
              />
              <Textarea
                placeholder="Example"
                name="example"
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
              />
              <Button
                colorScheme="teal"
                onClick={handleAddWord}
                w={"full"}
              >
                Add Word
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </>
  );
}

export default AddNewEntry;