import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Select,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { useWordStore } from '../store/words';

function AddRelationshipModal({ isOpen, onClose, currentWord }) {
  const [selectedWordId, setSelectedWordId] = useState('');
  const [relationshipType, setRelationshipType] = useState('see_also');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { words, addRelationship, fetchWords } = useWordStore();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  // Fetch words when modal opens
  useEffect(() => {
    if (isOpen && words.length === 0) {
      console.log('Modal opened, fetching words...');
      fetchWords();
    }
  }, [isOpen, fetchWords, words.length]);

  // Debug: Log words and filtered results
  useEffect(() => {
    console.log('Total words in store:', words.length);
    console.log('Search term:', searchTerm);
    console.log('Current word:', currentWord?.word);
    console.log('Filtered words count:', filteredWords.length);
    if (filteredWords.length > 0) {
      console.log('Sample filtered words:', filteredWords.slice(0, 5).map(w => w.word));
    }
  }, [words.length, searchTerm, currentWord]);

  // Filter words based on search term
  const filteredWords = words
    .filter(w => w._id !== currentWord?._id)
    .filter(w => 
      searchTerm === '' || 
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 50); // Limit to 50 results for performance

  const handleSubmit = async () => {
    if (!selectedWordId || !relationshipType) {
      toast({
        title: 'Missing fields',
        description: 'Please select a word and relationship type',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    const { success, message } = await addRelationship(
      currentWord._id,
      selectedWordId,
      relationshipType
    );

    setIsLoading(false);

    if (success) {
      toast({
        title: 'Relationship added',
        description: 'The word relationship has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Note: The store's addRelationship function already updates both words and selectedWord
      // Fetch words to ensure we have the latest data for all words
      await fetchWords();
      
      // Reset form
      setSelectedWordId('');
      setRelationshipType('see_also');
      setSearchTerm('');
      
      onClose();
    } else {
      toast({
        title: 'Error',
        description: message || 'Failed to add relationship',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setSelectedWordId('');
    setRelationshipType('see_also');
    setSearchTerm('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Add Related Word to "{currentWord?.word}"</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Relationship Type</FormLabel>
              <Select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value)}
                borderColor={borderColor}
              >
                <option value="singular">Singular form</option>
                <option value="plural">Plural form</option>
                <option value="synonym">Synonym</option>
                <option value="antonym">Antonym</option>
                <option value="variant">Variant</option>
                <option value="derived">Derived from</option>
                <option value="see_also">See also</option>
                <option value="infinitive">Infinitive</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Search Word</FormLabel>
              <Input
                placeholder="Type to search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderColor={borderColor}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Select Related Word</FormLabel>
              {words.length === 0 ? (
                <Text fontSize="sm" color="orange.500" mb={2}>
                  Loading words...
                </Text>
              ) : (
                <Text fontSize="sm" color="gray.500" mb={2}>
                  {filteredWords.length} words available (filtered from {words.length} total)
                </Text>
              )}
              <Select
                placeholder="Select a word..."
                value={selectedWordId}
                onChange={(e) => setSelectedWordId(e.target.value)}
                borderColor={borderColor}
                maxH="200px"
                isDisabled={words.length === 0 || filteredWords.length === 0}
              >
                {filteredWords.length === 0 && words.length > 0 ? (
                  <option disabled>No words found</option>
                ) : (
                  filteredWords.map(word => (
                    <option key={word._id} value={word._id}>
                      {word.word} - {word.meaning.substring(0, 50)}
                      {word.meaning.length > 50 ? '...' : ''}
                    </option>
                  ))
                )}
              </Select>
              {searchTerm && filteredWords.length === 0 && words.length > 0 && (
                <Text fontSize="sm" color="orange.500" mt={2}>
                  No words found matching "{searchTerm}". Try a different search term.
                </Text>
              )}
              {!searchTerm && words.length > 1 && filteredWords.length === 0 && (
                <Text fontSize="sm" color="gray.500" mt={2}>
                  All other words have been filtered out
                </Text>
              )}
              {!searchTerm && words.length === 1 && (
                <Text fontSize="sm" color="orange.500" mt={2}>
                  No other words in database. Please add more words first.
                </Text>
              )}
              {filteredWords.length >= 50 && (
                <Text fontSize="sm" color="orange.500" mt={2}>
                  Showing first 50 results. Use search to narrow down.
                </Text>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="teal" 
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!selectedWordId || !relationshipType}
          >
            Add Relationship
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AddRelationshipModal;
