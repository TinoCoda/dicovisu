import React, { useState, useEffect } from 'react';
import { Box, VStack, Input, Textarea, Button, useToast } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWordStore } from '../store/words';

function EditWordPage() {
 
  
  const { words, updateWord,selectedWord, setSelectedWord } = useWordStore(); // Access words and updateWord function
  const navigate = useNavigate();
  const _id=selectedWord._id; // Get the ID of the selected word
  const toast = useToast();

    //const wordDetails= selectedWord 
    const [wordDetails, setWordDetails] = useState(
   selectedWord);


  const handleSave = async () => {
    const { success, message } = await updateWord(_id, wordDetails);
    if (success) {
      toast({
        title: 'Word updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedWord(wordDetails); // Update the selected word in the store
      navigate('/details'); // Redirect to the home page or detail page
    } else {
      toast({
        title: 'Failed to update word',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={4}>
        <Input
          placeholder="Word"
          value={wordDetails.word}
          onChange={(e) => setWordDetails({ ...wordDetails, word: e.target.value })}
        />
        <Input
          placeholder="Meaning"
          value={wordDetails.meaning}
          onChange={(e) => setWordDetails({ ...wordDetails, meaning: e.target.value })}
        />
        <Input
          placeholder="other translations (comma separated)"
          value={wordDetails.translations}
          onChange={(e) => setWordDetails({ ...wordDetails, translations: e.target.value.split(',').map(t => t.trim()) })}
        />
        <Textarea
          placeholder="Description"
          value={wordDetails.description}
          onChange={(e) => setWordDetails({ ...wordDetails, description: e.target.value })}
        />
        <Textarea
          placeholder="Example"
          value={wordDetails.example}
          onChange={(e) => setWordDetails({ ...wordDetails, example: e.target.value })}
        />
        <Button colorScheme="teal" onClick={handleSave}>
          Save Changes
        </Button>
      </VStack>
    </Box>
  );
}

export default EditWordPage;