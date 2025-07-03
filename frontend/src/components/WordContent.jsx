import React from 'react';
import { Text, VStack } from '@chakra-ui/react';

function WordContent({ selectedWord }) {
  // Function to extract original text and translation pairs
  function extractTranslations(exampleString) {
    const sentences = exampleString.split('.').map((sentence) => sentence.trim()).filter(Boolean);
    const regex = /\([A-Za-z]{1,2}\d*\)$/;

    const translations = [];
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (regex.test(sentence)) {
        const originalText = sentence + '.'; // Add the period back
        const translation = sentences[i + 1] ? sentences[i + 1] + '.' : ''; // Get the next sentence
        translations.push({ originalText, translation });
      }
    }
    return translations;
  }

  // Prepare the content to display
  const translations = selectedWord?.example ? extractTranslations(selectedWord.example) : [];

  return (
    <VStack>
      <Text fontWeight="bold" fontSize="md">
        {selectedWord.meaning}
      </Text>
      <Text>
        {selectedWord.description !== '' ? selectedWord.description : 'ajoute une description...'}
      </Text>
      <VStack spacing={4} align="start" mt={4} mb={4} w="100%">
        {translations.length > 0 ? (
          translations.map((pair, index) => (
            <React.Fragment key={index}>
              <Text fontStyle="italic" fontWeight="bold">
                {pair.originalText}
              </Text>
              <Text>{pair.translation}</Text>
            </React.Fragment>
          ))
        ) : (
          <Text>Aucun exemple n'a été fourni.</Text>
        )}
      </VStack>
    </VStack>
  );
}

export default WordContent;