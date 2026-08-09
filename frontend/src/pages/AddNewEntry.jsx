import React, { useState, useEffect } from 'react';
import { Box, Container, Text, VStack, Heading, Input, Button, useToast, Textarea } from "@chakra-ui/react";
import Select from 'react-select'; // Import react-select
import { useWordStore } from '../store/words';
import { useLanguageStore } from '../store/languages';
import { useCountryStore } from '../store/countries';
import { useReactSelectStyles } from '../utils/reactSelectTheme';
import AudioRecorder from '../components/AudioRecorder';
import { useUploadAudioEndpoint } from '../api/words/wordApi';

function AddNewEntry() {
  const [newWord, setNewWord] = useState({
    word: "",
    meaning: "",
    language: [], // Updated to an array for multiple languages
    description: "",
    example: "",
  });
  const [translationsRaw, setTranslationsRaw] = useState("");
  const [audioFile, setAudioFile] = useState(null);

  const toast = useToast();
  const { addWord } = useWordStore();
  const { languages, fetchLanguages } = useLanguageStore();
  const { fetchCountries } = useCountryStore();

  useEffect(() => {
    fetchLanguages();
    fetchCountries();
  }, [fetchLanguages, fetchCountries]);

  const handleAddWord = async () => {
    // Split translations only at submit time, support comma or semicolon separators
    const translationsArray = translationsRaw
      .split(/[,;]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
    const wordToSubmit = { ...newWord, translations: translationsArray };

    const { success, message, word: savedWord } = await addWord(wordToSubmit);

    if (success) {
      // If audio was recorded/uploaded, upload it now
      if (audioFile && savedWord?._id) {
        try {
          const audioResponse = await useUploadAudioEndpoint(savedWord._id, audioFile);
          // Update the word in the store with the audio metadata
          if (audioResponse.success && audioResponse.data?.word) {
            useWordStore.setState((state) => ({
              words: state.words.map((w) =>
                w._id === savedWord._id ? audioResponse.data.word : w
              )
            }));
          }
          toast({
            title: "Word and audio added successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } catch (error) {
          toast({
            title: "Word saved but audio upload failed",
            description: error.message,
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: "Word added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      // Reset form
      setNewWord({
        word: "",
        meaning: "",
        language: [],
        description: "",
        example: "",
      });
      setTranslationsRaw("");
      setAudioFile(null);
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

  const handleAudioReady = (blob) => {
    setAudioFile(blob);
  };

  const handleLanguageChange = (selectedOptions) => {
    // Update the language field with an array of selected language codes
    const selectedLanguages = selectedOptions.map((option) => option.value);
    setNewWord({ ...newWord, language: selectedLanguages });
  };

  const selectStyles = useReactSelectStyles();

  return (
    <>
      <Container maxW={"container.sm"} px={{ base: 4, md: 6 }} py={{ base: 4, md: 8 }}>
        <VStack spacing={{ base: 6, md: 8 }}>
          <VStack spacing={1}>
            <Heading
              as="h1"
              fontFamily="heading"
              fontStyle="italic"
              fontWeight="500"
              size={{ base: 'lg', md: 'xl' }}
              textAlign="center"
              color="text-primary"
            >
              Longa diambu dyampa
            </Heading>
            <Text fontSize="sm" color="text-muted">Add a new word to the dictionary</Text>
          </VStack>
          <Box
            w={"full"}
            bg="bg-surface"
            border="1px solid"
            borderColor="border-default"
            p={{ base: 4, md: 6 }}
            rounded={"lg"}
          >
            <VStack spacing={4}>
              <Input
                placeholder="Word"
                name="word"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                size={{ base: 'md', md: 'lg' }}
                fontSize={{ base: 'md', md: 'lg' }}
              />
              <Input
                placeholder="Meaning"
                name="meaning"
                value={newWord.meaning}
                onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                size={{ base: 'md', md: 'lg' }}
                fontSize={{ base: 'md', md: 'lg' }}
              />
              <Input
                placeholder="other translations (comma or semicolon separated)"
                name="translations"
                value={translationsRaw}
                onChange={(e) => setTranslationsRaw(e.target.value)}
                size={{ base: 'md', md: 'lg' }}
                fontSize={{ base: 'md', md: 'lg' }}
              />
              <Box w="100%">
                <Select
                  isMulti
                  options={languages.map((language) => ({
                    value: language.code,
                    label: language.name,
                  }))}
                  placeholder="Select Languages"
                  onChange={handleLanguageChange}
                  value={newWord.language.map((code) => ({
                    value: code,
                    label: languages.find((lang) => lang.code === code)?.name || code,
                  }))}
                  styles={selectStyles}
                />
              </Box>
              <Textarea
                placeholder="Description"
                name="description"
                value={newWord.description}
                onChange={(e) => setNewWord({ ...newWord, description: e.target.value })}
                minH={{ base: '80px', md: '100px' }}
                fontSize={{ base: 'md', md: 'lg' }}
              />
              <Textarea
                placeholder="Example"
                name="example"
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                minH={{ base: '120px', md: '150px' }}
                fontSize={{ base: 'md', md: 'lg' }}
              />
              <AudioRecorder
                onAudioReady={handleAudioReady}
                existingAudioUrl={null}
                onDeleteAudio={null}
              />
              <Button
                colorScheme="blue"
                onClick={handleAddWord}
                w={"full"}
                size={{ base: 'lg', md: 'lg' }}
                h={{ base: '50px', md: '60px' }}
                fontSize={{ base: 'lg', md: 'xl' }}
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