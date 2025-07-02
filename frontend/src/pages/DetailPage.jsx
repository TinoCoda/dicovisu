import React from 'react';
import { VStack, Button } from '@chakra-ui/react';
import WordTitle from '../components/WordTitle';
import WordContent from '../components/WordContent';
import { useWordStore } from '../store/words';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

function DetailPage() {
  const { selectedWord } = useWordStore();
  const navigate = useNavigate(); // Initialize useNavigate

  console.log("selectedWord", selectedWord);

  const handleEdit = () => {
    // Navigate to the edit page with the selected word's ID
    navigate(`/edit-word/${selectedWord._id}`);
  };

  return (
    <VStack p={2}>
      <WordTitle word={selectedWord.word} />
      <WordContent selectedWord={selectedWord} />
      <Button
        colorScheme="blue"
        onClick={handleEdit}
        mt={2}
      >
        Edit Word
      </Button>
    </VStack>
  );
}

export default DetailPage;