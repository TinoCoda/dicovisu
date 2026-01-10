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
  const [results, setResults] = useState({ success: [], failed: [], duplicates: [] });

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
    const seenWords = new Map(); // Changed to Map to track first occurrence
    const duplicatesFound = [];

    words.forEach((wordObj, index) => {
      // Skip invalid word objects
      if (!wordObj || !wordObj.word || !wordObj.meaning) {
        console.warn('Skipping invalid word object in removeDuplicates:', wordObj);
        return;
      }
      
      const key = `${wordObj.word}-${wordObj.meaning}`.toLowerCase();
      
      if (!seenWords.has(key)) {
        seenWords.set(key, { word: wordObj, index });
        uniqueWords.push(wordObj);
      } else {
        // This is a duplicate - track it
        const firstOccurrence = seenWords.get(key);
        duplicatesFound.push({
          duplicate: {
            word: wordObj.word,
            meaning: wordObj.meaning,
            description: wordObj.description,
            translations: wordObj.translations,
            example: wordObj.example,
            position: index + 1 // 1-based position in file
          },
          original: {
            word: firstOccurrence.word.word,
            meaning: firstOccurrence.word.meaning,
            description: firstOccurrence.word.description,
            translations: firstOccurrence.word.translations,
            example: firstOccurrence.word.example,
            position: firstOccurrence.index + 1
          },
          suggestion: {
            action: "Duplicate entry in JSON file",
            reason: "Same word and meaning appear multiple times in the import file"
          }
        });
      }
    });

    return { uniqueWords, duplicatesFound };
  };

  const mergeWordData = (existingWord, newWordData, languageCodes) => {
    // Merge descriptions - append if new description is different
    let mergedDescription = existingWord.description || '';
    if (newWordData.description && newWordData.description !== existingWord.description) {
      mergedDescription = newWordData.description
        ? `\n${newWordData.description}` 
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

  // Export duplicates to JSON file for download
  const exportDuplicatesToJson = (duplicatesList) => {
    const exportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalDuplicates: duplicatesList.length,
        description: "Words that already exist in the database. Review to potentially add as synonyms, variants, or relationships."
      },
      duplicates: duplicatesList
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `duplicates-review-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`📄 Exported ${duplicatesList.length} duplicates to JSON file`);
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
    setResults({ success: [], failed: [], duplicates: [] });

    // Remove duplicates from the import file and track them
    const { uniqueWords, duplicatesFound } = removeDuplicates(wordsData);
    const languageCodes = selectedLanguages.map((lang) => lang.value);

    toast({
      title: 'Import Started',
      description: `Processing ${uniqueWords.length} unique words (found ${duplicatesFound.length} duplicates in JSON file).`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    const successList = [];
    const failedList = [];

    // Fetch all existing words first to ensure the store is up-to-date
    await fetchWords();
    
    // Get all existing words from the store
    const existingWordsMap = new Map(
      useWordStore.getState().words.map(w => [w.word.toLowerCase().trim(), w])
    );

    console.log(`Existing words in store: ${existingWordsMap.size}`); // Debug log

    // PHASE 1: Create/Update all words and build a word → ID map
    const wordIdMap = new Map(); // Maps normalized word text → word ID
    
    for (let i = 0; i < uniqueWords.length; i++) {
      const newWordData = uniqueWords[i];
      
      console.log(`\n=== Processing word ${i + 1}/${uniqueWords.length} ===`);
      console.log('Word data:', JSON.stringify(newWordData, null, 2));
      
      // Validate that the word object has required fields
      if (!newWordData || !newWordData.word || !newWordData.meaning) {
        console.error('❌ VALIDATION FAILED: Invalid word object');
        failedList.push({ 
          word: newWordData?.word || 'Unknown', 
          error: 'Missing required fields (word or meaning)' 
        });
        continue;
      }

      console.log(`✓ Validation passed for: "${newWordData.word}"`);
      const existingWord = existingWordsMap.get(newWordData.word.toLowerCase().trim());
      console.log(`Existing word check: ${existingWord ? 'FOUND (will update)' : 'NOT FOUND (will add)'}`);

      try {
        if (existingWord) {
          console.log(`→ Updating existing word: "${newWordData.word}"`);
          
          // Word exists - merge the data
          const mergedData = mergeWordData(existingWord, newWordData, languageCodes);
          
          // Update the existing word
          const { success, message } = await updateWord(existingWord._id, mergedData);
          
          console.log(`Update result - success: ${success}, message: ${message}`);
          
          if (success) {
            successList.push({ 
              word: newWordData.word, 
              message: 'Updated with merged data' 
            });
            wordIdMap.set(newWordData.word.toLowerCase().trim(), existingWord._id);
            console.log(`✓ Word updated successfully`);
          } else {
            failedList.push({ 
              word: newWordData.word, 
              error: message || 'Failed to update' 
            });
            console.log(`✗ Update failed: ${message}`);
          }
        } else {
          console.log(`→ Adding new word: "${newWordData.word}"`);
          // Word doesn't exist - add it
          const wordData = {
            ...newWordData,
            language: languageCodes,
            translations: newWordData.translations || [],
            description: newWordData.description || "", // Ensure description is always a string
            example: newWordData.example || "",
          };
          console.log('Word data to send:', JSON.stringify(wordData, null, 2));
          
          // Remove relatedWords from initial creation to avoid errors
          delete wordData.relatedWords;

          console.log('Calling addWord...');
          const response = await addWord(wordData);
          console.log('addWord response:', JSON.stringify(response, null, 2));
          
          const { success, message, word: createdWord } = response || {};
          console.log(`Destructured - success: ${success}, message: ${message}, createdWord:`, createdWord);
          
          if (success && createdWord) {
            successList.push({ word: wordData.word, message: 'Added successfully' });
            wordIdMap.set(wordData.word.toLowerCase().trim(), createdWord._id);
            console.log(`✓ Word added successfully, ID: ${createdWord._id}`);
          } else {
            failedList.push({ word: wordData.word, error: message || 'Unknown error' });
            console.log(`✗ Add failed: ${message}`);
          }
        }
      } catch (error) {
        console.error(`💥 EXCEPTION caught for word "${newWordData.word}":`, error);
        console.error('Error stack:', error.stack);
        console.error('Full data:', newWordData);
        failedList.push({ 
          word: newWordData.word, 
          error: error.message || 'Unexpected error during import' 
        });
      }

      // Update progress (50% for word creation)
      setProgress(((i + 1) / uniqueWords.length) * 50);
    }

    // PHASE 2: Process relationships (only if any words have relatedWords)
    const relationshipsProcessed = [];
    const relationshipsFailed = [];
    const relationshipsSkipped = [];
    
    // Check if any words have relatedWords to process
    const hasRelationships = uniqueWords.some(w => w.relatedWords && Array.isArray(w.relatedWords) && w.relatedWords.length > 0);
    
    if (hasRelationships) {
      // Refresh the word store to include newly created words
      await fetchWords();
      
      console.log('\n🔗 PHASE 2: Processing Relationships...');

      for (let i = 0; i < uniqueWords.length; i++) {
        const wordData = uniqueWords[i];
        if (!wordData.relatedWords || !Array.isArray(wordData.relatedWords) || wordData.relatedWords.length === 0) {
          continue;
        }

        console.log(`\n→ Processing relationships for: "${wordData.word}"`);
        console.log(`  Found ${wordData.relatedWords.length} relationship(s)`);

        const sourceWordId = wordIdMap.get(wordData.word.toLowerCase().trim());
        if (!sourceWordId) {
          console.log(`  ⚠️ Source word ID not found, skipping`);
          continue; // Skip if source word wasn't created successfully
        }

        for (const relationship of wordData.relatedWords) {
          // Support both "type" and "relationshipType" field names
          const relationshipType = relationship.relationshipType || relationship.type;
          
          console.log(`  → Relationship: "${wordData.word}" -> "${relationship.word}" (${relationshipType})`);
          
          // Validate relationship structure
          if (!relationship || !relationship.word || !relationshipType) {
            console.log(`  ✗ Invalid structure`);
            relationshipsFailed.push({
              from: wordData.word,
              to: relationship?.word || 'unknown',
              error: 'Invalid relationship structure (missing word or type/relationshipType)'
            });
            continue;
          }

          const targetWordText = relationship.word.toLowerCase().trim();
          let targetWordId = wordIdMap.get(targetWordText);
          
          // If not found in imported words, search the entire database
          if (!targetWordId) {
            console.log(`  → Target not in imported batch, searching database...`);
            const allWords = useWordStore.getState().words;
            const existingTargetWord = allWords.find(
              w => w.word.toLowerCase().trim() === targetWordText
            );
            
            if (existingTargetWord) {
              targetWordId = existingTargetWord._id;
              console.log(`  ✓ Found in database: ${targetWordId}`);
            } else {
              // Target word doesn't exist yet - skip but note for user
              console.log(`  ⊗ Target word "${relationship.word}" not found in database - skipping`);
              relationshipsSkipped.push({
                from: wordData.word,
                to: relationship.word,
                type: relationshipType
              });
              continue;
            }
          } else {
            console.log(`  ✓ Target found in imported batch`);
          }

          try {
            console.log(`  → Creating relationship in database...`);
            console.log(`     Source ID: ${sourceWordId}`);
            console.log(`     Target ID: ${targetWordId}`);
            console.log(`     Type: ${relationshipType}`);
            
            const result = await useWordStore.getState().addRelationship(
              sourceWordId,
              targetWordId,
              relationshipType  // Only 3 parameters: sourceId, targetId, type
            );
            
            if (result.success) {
              console.log(`  ✓ Relationship created successfully`);
              relationshipsProcessed.push({
                from: wordData.word,
                to: relationship.word,
                type: relationshipType
              });
            } else {
              console.log(`  ✗ Failed to create: ${result.message}`);
              relationshipsFailed.push({
                from: wordData.word,
                to: relationship.word,
                error: result.message || 'Failed to create relationship'
              });
            }
          } catch (error) {
            console.log(`  💥 Exception: ${error.message}`);
            relationshipsFailed.push({
              from: wordData.word,
              to: relationship.word,
              error: error.message
            });
          }
        }

        // Update progress (50-100% for relationships)
        setProgress(50 + ((i + 1) / uniqueWords.length) * 50);
      }
    } else {
      // No relationships to process, set progress to 100%
      console.log('No relationships to process');
      setProgress(100);
    }

    setResults({ success: successList, failed: failedList, duplicates: duplicatesFound });
    setIsProcessing(false);

    // Export duplicates to JSON file if any were found
    if (duplicatesFound.length > 0) {
      exportDuplicatesToJson(duplicatesFound);
    }

    // Build detailed message
    let statusType = 'success';
    let title = 'Import Completed Successfully';
    let description = `${successList.length} word${successList.length !== 1 ? 's' : ''} imported successfully.`;
    
    // Mention duplicates if found in JSON file
    if (duplicatesFound.length > 0) {
      description += ` ${duplicatesFound.length} duplicate${duplicatesFound.length !== 1 ? 's' : ''} found in JSON file (exported for review).`;
    }
    
    // Only mention relationships if there were any to process
    if (relationshipsProcessed.length > 0) {
      description += ` ${relationshipsProcessed.length} relationship${relationshipsProcessed.length !== 1 ? 's' : ''} created.`;
    }
    
    if (relationshipsSkipped.length > 0) {
      description += ` ${relationshipsSkipped.length} relationship${relationshipsSkipped.length !== 1 ? 's' : ''} skipped (target words not in dictionary yet).`;
      // Only change to warning if words were actually imported successfully
      if (failedList.length === 0) {
        statusType = 'warning';
        title = 'Import Completed with Warnings';
      }
    }
    
    if (relationshipsFailed.length > 0) {
      description += ` ${relationshipsFailed.length} relationship${relationshipsFailed.length !== 1 ? 's' : ''} failed.`;
      if (failedList.length === 0) {
        statusType = 'warning';
        title = 'Import Completed with Warnings';
      }
    }
    
    // Word failures are more serious - override status
    if (failedList.length > 0) {
      const failedCount = failedList.length;
      const totalCount = uniqueWords.length;
      
      if (failedCount === totalCount) {
        // All words failed
        statusType = 'error';
        title = 'Import Failed';
        description = `All ${failedCount} words failed to import.`;
      } else {
        // Some words failed
        statusType = 'error';
        title = 'Import Completed with Errors';
        description = `${failedCount} of ${totalCount} words failed. ${successList.length} imported successfully.`;
        
        if (relationshipsProcessed.length > 0 || relationshipsSkipped.length > 0) {
          const relMsg = [];
          if (relationshipsProcessed.length > 0) relMsg.push(`${relationshipsProcessed.length} relationships created`);
          if (relationshipsSkipped.length > 0) relMsg.push(`${relationshipsSkipped.length} skipped`);
          if (relationshipsFailed.length > 0) relMsg.push(`${relationshipsFailed.length} failed`);
          description += ` Relationships: ${relMsg.join(', ')}.`;
        }
      }
    }

    toast({
      title,
      description,
      status: statusType,
      duration: 7000,
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

        {(results.success.length > 0 || results.failed.length > 0 || results.duplicates.length > 0) && (
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
                      {item.word} - {item.message}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {results.duplicates.length > 0 && (
              <Box mb={4}>
                <Alert status="warning">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>Duplicates in JSON File ({results.duplicates.length})</AlertTitle>
                    <AlertDescription>
                      {results.duplicates.length} word{results.duplicates.length !== 1 ? 's' : ''} appear multiple times in your JSON file. 
                      A JSON file has been downloaded for you to review these duplicates.
                    </AlertDescription>
                  </Box>
                </Alert>
                <List spacing={2} maxH="200px" overflowY="auto" mt={2}>
                  {results.duplicates.map((item, index) => (
                    <ListItem key={index}>
                      <ListIcon as={MdCheckCircle} color="orange.500" />
                      {item.duplicate.word} (appears at positions {item.original.position} and {item.duplicate.position})
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
