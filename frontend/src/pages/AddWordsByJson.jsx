import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Button,
  Text,
  useColorModeValue,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { MdCheckCircle, MdError, MdUpload } from 'react-icons/md';
import Select from 'react-select';
import { useLanguageStore } from '../store/languages';
import { useWordStore } from '../store/words';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

function AddWordsByJson() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [wordsData, setWordsData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({ success: [], failed: [] });

  const toast = useToast();
  const navigate = useNavigate();
  const { languages, fetchLanguages } = useLanguageStore();
  const { addWord, updateWord, fetchWords } = useWordStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const roles = useAuthStore((state) => state.roles);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  // Check if user has superadmin role
  useEffect(() => {
    const isSuperAdmin = roles.includes('Admin') || roles.includes('superadmin');
    if (!isAuthenticated || !isSuperAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You need superadmin privileges to access this page.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    }
  }, [isAuthenticated, roles, navigate, toast]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a JSON file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedFile(file);
    
    // Read and parse the JSON file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!Array.isArray(json)) {
          throw new Error('JSON file must contain an array of words');
        }
        setWordsData(json);
        toast({
          title: 'File Loaded',
          description: `${json.length} words found in the file.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Parse Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setSelectedFile(null);
        setWordsData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleLanguageChange = (selectedOptions) => {
    setSelectedLanguages(selectedOptions || []);
  };

  const removeDuplicates = (words) => {
    const uniqueWords = [];
    const seenWords = new Set();

    words.forEach((wordObj) => {
      const key = `${wordObj.word}-${wordObj.meaning}`.toLowerCase();
      if (!seenWords.has(key)) {
        seenWords.add(key);
        uniqueWords.push(wordObj);
      }
    });

    return uniqueWords;
  };

  const mergeWordData = (existingWord, newWordData, languageCodes) => {
    // Merge descriptions - append if new description is different
    let mergedDescription = existingWord.description || '';
    if (newWordData.description && newWordData.description !== existingWord.description) {
      mergedDescription = mergedDescription 
        ? `${mergedDescription}\n\n${newWordData.description}` 
        : newWordData.description;
    }

    // Merge examples - append if new example is different
    let mergedExample = existingWord.example || '';
    if (newWordData.example) {
      // Normalize and compare examples (trim whitespace, case-insensitive)
      const existingNormalized = (existingWord.example || '').toLowerCase().trim();
      const newNormalized = newWordData.example.toLowerCase().trim();
      
      if (existingNormalized !== newNormalized) {
        mergedExample = mergedExample 
          ? `${mergedExample} ${newWordData.example}` 
          : newWordData.example;
      }
    }

    // Merge translations - add new unique translations
    const existingTranslations = new Set(existingWord.translations || []);
    const newTranslations = newWordData.translations || [];
    newTranslations.forEach(translation => {
      if (translation && translation.trim()) {
        existingTranslations.add(translation.trim());
      }
    });

    // Merge languages - add new unique language codes
    const existingLanguages = new Set(existingWord.language || []);
    languageCodes.forEach(code => existingLanguages.add(code));

    return {
      description: mergedDescription,
      example: mergedExample,
      translations: Array.from(existingTranslations),
      language: Array.from(existingLanguages),
    };
  };

  const handleImport = async () => {
    if (!selectedFile || wordsData.length === 0) {
      toast({
        title: 'No File Selected',
        description: 'Please select a JSON file first.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedLanguages.length === 0) {
      toast({
        title: 'No Language Selected',
        description: 'Please select at least one language.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults({ success: [], failed: [] });

    // Remove duplicates from the import file
    const uniqueWords = removeDuplicates(wordsData);
    const languageCodes = selectedLanguages.map((lang) => lang.value);

    toast({
      title: 'Import Started',
      description: `Processing ${uniqueWords.length} unique words (removed ${wordsData.length - uniqueWords.length} duplicates).`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    const successList = [];
    const failedList = [];

    // Get all existing words from the store
    const existingWordsMap = new Map(
      useWordStore.getState().words.map(w => [w.word.toLowerCase(), w])
    );

    // Process words one by one
    for (let i = 0; i < uniqueWords.length; i++) {
      const newWordData = uniqueWords[i];
      const existingWord = existingWordsMap.get(newWordData.word.toLowerCase());

      try {
        if (existingWord) {
          // Word exists - merge the data
          const mergedData = mergeWordData(existingWord, newWordData, languageCodes);
          
          // Update the existing word
          const { success, message } = await updateWord(existingWord._id, mergedData);
          
          if (success) {
            successList.push({ 
              word: newWordData.word, 
              message: 'Updated with merged data' 
            });
          } else {
            failedList.push({ 
              word: newWordData.word, 
              error: message || 'Failed to update' 
            });
          }
        } else {
          // Word doesn't exist - add it
          const wordData = {
            ...newWordData,
            language: languageCodes,
            translations: newWordData.translations || [],
          };

          const { success, message } = await addWord(wordData);
          if (success) {
            successList.push({ word: wordData.word, message: 'Added successfully' });
          } else {
            failedList.push({ word: wordData.word, error: message });
          }
        }
      } catch (error) {
        failedList.push({ word: newWordData.word, error: error.message });
      }

      // Update progress
      setProgress(((i + 1) / uniqueWords.length) * 100);
    }

    setResults({ success: successList, failed: failedList });
    setIsProcessing(false);

    // Refresh the words list to get the latest data
    await fetchWords();

    toast({
      title: 'Import Completed',
      description: `${successList.length} words processed successfully, ${failedList.length} failed.`,
      status: successList.length > 0 ? 'success' : 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: useColorModeValue('white', 'gray.700'),
      borderColor: state.isFocused ? 'teal' : useColorModeValue('gray.300', 'gray.600'),
      color: useColorModeValue('black', 'white'),
      boxShadow: state.isFocused ? '0 0 0 1px teal' : 'none',
      '&:hover': {
        borderColor: 'teal',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'black',
      border: '1px solid white',
      zIndex: 10,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'gray' : 'black',
      color: 'white',
      '&:hover': {
        backgroundColor: 'gray',
        color: 'white',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: useColorModeValue('teal.100', 'teal.600'),
      color: useColorModeValue('black', 'white'),
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: useColorModeValue('black', 'white'),
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: useColorModeValue('black', 'white'),
      '&:hover': {
        backgroundColor: useColorModeValue('teal.200', 'teal.700'),
        color: useColorModeValue('black', 'white'),
      },
    }),
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Bulk Import Words from JSON
        </Heading>

        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Expected JSON Format:</AlertTitle>
            <AlertDescription>
              An array of word objects with properties: word (required), meaning (required), translations (optional array), description (optional), example (optional). Existing words will be merged with new data.
            </AlertDescription>
          </Box>
        </Alert>

        <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text mb={2} fontWeight="bold">
                1. Select JSON File
              </Text>
              <Button
                leftIcon={<MdUpload />}
                as="label"
                htmlFor="file-upload"
                colorScheme="blue"
                cursor="pointer"
              >
                Choose File
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {selectedFile && (
                <Text mt={2} fontSize="sm" color="gray.500">
                  Selected: {selectedFile.name} ({wordsData.length} words)
                </Text>
              )}
            </Box>

            <Box>
              <Text mb={2} fontWeight="bold">
                2. Select Language(s)
              </Text>
              <Select
                isMulti
                options={languages.map((language) => ({
                  value: language.code,
                  label: language.name,
                }))}
                placeholder="Select languages for these words..."
                onChange={handleLanguageChange}
                value={selectedLanguages}
                styles={customStyles}
              />
            </Box>

            <Button
              colorScheme="teal"
              size="lg"
              onClick={handleImport}
              isDisabled={!selectedFile || selectedLanguages.length === 0 || isProcessing}
              isLoading={isProcessing}
              loadingText="Importing..."
            >
              Import Words
            </Button>
          </VStack>
        </Box>

        {isProcessing && (
          <Box>
            <Text mb={2}>Progress: {Math.round(progress)}%</Text>
            <Progress value={progress} colorScheme="teal" size="lg" hasStripe isAnimated />
          </Box>
        )}

        {(results.success.length > 0 || results.failed.length > 0) && (
          <Box>
            {results.success.length > 0 && (
              <Box mb={4}>
                <Heading size="md" color="green.500" mb={2}>
                  Successfully Added ({results.success.length})
                </Heading>
                <List spacing={2} maxH="200px" overflowY="auto">
                  {results.success.map((item, index) => (
                    <ListItem key={index}>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      {item.word}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {results.failed.length > 0 && (
              <Box>
                <Heading size="md" color="red.500" mb={2}>
                  Failed ({results.failed.length})
                </Heading>
                <List spacing={2} maxH="200px" overflowY="auto">
                  {results.failed.map((item, index) => (
                    <ListItem key={index}>
                      <ListIcon as={MdError} color="red.500" />
                      {item.word} - {item.error}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default AddWordsByJson;
