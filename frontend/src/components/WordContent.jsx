import React from 'react';
import { Text, VStack } from '@chakra-ui/react';

function WordContent({ selectedWord }) {
  // Function to extract original text and translation pairs
  function extractTranslations(exampleString) {
    // Split on period, question mark, or exclamation mark
     const splitSentencesAndPunctuation=(text) => {
      const regex = /([^.!?]+)([.!?])/g;
      const sentences = [];
      const punctuations = [];
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        sentences.push(match[1].trim());
        punctuations.push(match[2]);
      }
      
      return { sentences, punctuations };
    }

    const { sentences, punctuations } = splitSentencesAndPunctuation(exampleString);
    
    const regex = /\([A-Za-z]{1,2}\d+[A-Za-z]?\)$/; // matching language codes like (FR1), (H16d), etc.
  
    const translations = [];
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (regex.test(sentence)) {
        const originalText = sentence + punctuations[i]; 
        const translation = sentences[i + 1] ? sentences[i + 1] + punctuations[i+1] : '';
        translations.push({ originalText, translation });
      }
    }
    return translations;
  }
  

  // Prepare the content to display
  const translations = selectedWord?.example ? extractTranslations(selectedWord.example) : [];

  return (
    <VStack>
      <Text fontStyle="italic" align="left">
        Language(s): {selectedWord.language.join(', ')}
      </Text>
      <Text fontWeight="bold" fontSize="md">
        {selectedWord.meaning}
      </Text>
      {selectedWord.translations && selectedWord.translations.length > 0 && (
        <Text fontStyle="italic" color="gray.600">
          Translations: {selectedWord.translations.join(', ')}
        </Text>
      )}
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