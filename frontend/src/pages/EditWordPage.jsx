import React, { useState, useEffect } from 'react';
import { Box, VStack, Input, Textarea, Button, useToast, Container, Heading } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWordStore } from '../store/words';
import AudioRecorder from '../components/AudioRecorder';
import { useUploadAudioEndpoint, useDeleteAudioEndpoint } from '../api/words/wordApi';

function EditWordPage() {
 
  
  const { words, updateWord,selectedWord, setSelectedWord } = useWordStore(); // Access words and updateWord function
  const navigate = useNavigate();
  const _id=selectedWord._id; // Get the ID of the selected word
  const toast = useToast();

  const [wordDetails, setWordDetails] = useState(selectedWord);
  // Keep translations as a raw editable string; split only when saving
  const [translationsRaw, setTranslationsRaw] = useState(
    Array.isArray(selectedWord.translations)
      ? selectedWord.translations.join(', ')
      : (selectedWord.translations || '')
  );
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(
    selectedWord.audio?.filename ? `/uploads/audio/${selectedWord.audio.filename}` : null
  );

  const handleSave = async () => {
    // Split on comma or semicolon at save time; preserve user whitespace during editing
    const translationsArray = translationsRaw
      .split(/[,;]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
    const detailsToSave = { ...wordDetails, translations: translationsArray };

    // Save word details first
    const { success, message } = await updateWord(_id, detailsToSave);

    if (success) {
      // Upload audio if a new file was recorded/uploaded
      if (audioFile) {
        try {
          const audioResponse = await useUploadAudioEndpoint(_id, audioFile);
          if (audioResponse.success) {
            toast({
              title: 'Word and audio updated successfully',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            setSelectedWord(audioResponse.data.word);
          }
        } catch (error) {
          toast({
            title: 'Word saved but audio upload failed',
            description: error.message,
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Word updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setSelectedWord(detailsToSave);
      }

      navigate('/details');
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

  const handleAudioReady = (blob) => {
    setAudioFile(blob);
  };

  const handleDeleteAudio = async () => {
    try {
      await useDeleteAudioEndpoint(_id);
      setAudioUrl(null);
      setAudioFile(null);
      toast({
        title: 'Audio deleted successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to delete audio',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.md" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Heading size={{ base: 'md', md: 'lg' }} textAlign="center">
          Edit Word
        </Heading>

        <Input
          placeholder="Word"
          value={wordDetails.word}
          onChange={(e) => setWordDetails({ ...wordDetails, word: e.target.value })}
          size={{ base: 'md', md: 'lg' }}
          fontSize={{ base: 'md', md: 'lg' }}
        />
        <Input
          placeholder="Meaning"
          value={wordDetails.meaning}
          onChange={(e) => setWordDetails({ ...wordDetails, meaning: e.target.value })}
          size={{ base: 'md', md: 'lg' }}
          fontSize={{ base: 'md', md: 'lg' }}
        />
        <Input
          placeholder="other translations (comma or semicolon separated)"
          value={translationsRaw}
          onChange={(e) => setTranslationsRaw(e.target.value)}
          size={{ base: 'md', md: 'lg' }}
          fontSize={{ base: 'md', md: 'lg' }}
        />
        <Textarea
          placeholder="Description"
          value={wordDetails.description}
          onChange={(e) => setWordDetails({ ...wordDetails, description: e.target.value })}
          minH={{ base: '80px', md: '100px' }}
          fontSize={{ base: 'md', md: 'lg' }}
        />
        <Textarea
          placeholder="Example"
          value={wordDetails.example}
          onChange={(e) => setWordDetails({ ...wordDetails, example: e.target.value })}
          minH={{ base: '120px', md: '150px' }}
          fontSize={{ base: 'md', md: 'lg' }}
        />
        <AudioRecorder
          onAudioReady={handleAudioReady}
          existingAudioUrl={audioUrl}
          onDeleteAudio={handleDeleteAudio}
        />
        <Button
          colorScheme="teal"
          onClick={handleSave}
          size={{ base: 'lg', md: 'lg' }}
          h={{ base: '50px', md: '60px' }}
          fontSize={{ base: 'lg', md: 'xl' }}
          w="100%"
        >
          Save Changes
        </Button>
      </VStack>
    </Container>
  );
}

export default EditWordPage;