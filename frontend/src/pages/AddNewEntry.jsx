import React, { useState, useEffect } from 'react'
import { Box, Container, Text, VStack, Heading, useColorModeValue, Input, Button, useToast, Textarea, Select as ChakraSelect } from "@chakra-ui/react"
import { useWordStore } from '../store/words'
import { useLanguageStore } from '../store/languages'
import { useCountryStore } from '../store/countries'

function AddNewEntry() {
  const [newWord, setNewWord] = useState({
    word: "",
    meaning: "",
    language: "",
    description: "",
    example: "",
  });

  const toast = useToast();
  const { addWord } = useWordStore();
  const { languages, fetchLanguages } = useLanguageStore();
  const { countries, fetchCountries,addCountry } = useCountryStore();

  useEffect(() => {
    fetchLanguages();
    fetchCountries();
  }, [fetchLanguages], [fetchCountries]);

  const handleAddWord = async () => {
    console.log("countries", useCountryStore.getState().countries);
    //const country={ name: "China", code: "CN" };
    //const {success,message}=await addCountry(country);
    
    const { success, message } = await addWord(newWord);
    console.log("addWord",success,message);

    if (success) {
      setNewWord({
        word: "",
        meaning: "",
        language: "",
        description: "",
        example: "",
      });
      console.log(success, message);

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

    console.log(newWord);
  }

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
              <ChakraSelect
                placeholder="Select Language"
                name="language"
                value={newWord.language}
                onChange={(e) => setNewWord({ ...newWord, language: e.target.value })}
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name}
                  </option>
                ))}
              </ChakraSelect>
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
  )
}

export default AddNewEntry