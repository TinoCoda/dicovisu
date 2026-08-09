import React, { useState, useEffect } from 'react';
import { VStack, Button, HStack, useDisclosure, Container, Box } from '@chakra-ui/react';
import { MdLink } from 'react-icons/md';
import WordTitle from '../components/WordTitle';
import WordContent from '../components/WordContent';
import AddRelationshipModal from '../components/AddRelationshipModal';
import { useWordStore } from '../store/words';
import { useNavigate } from 'react-router-dom';

function DetailPage() {
  const { selectedWord, setSelectedWord, words, fetchWords } = useWordStore();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch words when component mounts (in case user navigates directly to this page)
  useEffect(() => {
    if (words.length === 0) {
      fetchWords();
    }
  }, [fetchWords, words.length]);

  // Scroll to top whenever the displayed word changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedWord]);

  const handleEdit = () => {
    navigate(`/edit-word/${selectedWord._id}`);
  };

  const handleWordClick = (wordId) => {
    const word = words.find(w => w._id === wordId);
    if (word) {
      setSelectedWord(word);
    } else {
      console.error('Related word not found in store:', wordId);
    }
  };

  return (
    <Container maxW="container.md" centerContent py={8}>
      <VStack spacing={6} align="center" w="100%" key={selectedWord?._id}>
        {/* Word Title - Centered */}
        <Box textAlign="center">
          <WordTitle word={selectedWord.word} />
        </Box>

        {/* Word Content - Full width but contained */}
        <Box
          w="100%"
          bg="bg-surface"
          border="1px solid"
          borderColor="border-default"
          borderRadius="lg"
          p={{ base: 4, md: 6 }}
        >
          <WordContent selectedWord={selectedWord} onWordClick={handleWordClick} />
        </Box>

        {/* Action Buttons - Centered */}
        <HStack spacing={4} justify="center" pt={4}>
          <Button
            colorScheme="blue"
            onClick={handleEdit}
            size="md"
          >
            Edit Word
          </Button>
          <Button
            colorScheme="teal"
            leftIcon={<MdLink />}
            onClick={onOpen}
            size="md"
          >
            Add Relationship
          </Button>
        </HStack>
      </VStack>

      <AddRelationshipModal 
        isOpen={isOpen} 
        onClose={onClose} 
        currentWord={selectedWord} 
      />
    </Container>
  );
}

export default DetailPage;