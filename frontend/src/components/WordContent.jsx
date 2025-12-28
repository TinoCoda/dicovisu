import React from 'react';
import { Text, VStack, HStack, Link, Badge, Box, useColorModeValue } from '@chakra-ui/react';

function WordContent({ selectedWord, onWordClick }) {
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

  // Relationship type labels and colors
  const relationshipLabels = {
    singular: 'Singular',
    plural: 'Plural',
    synonym: 'Synonym',
    antonym: 'Antonym',
    variant: 'Variant',
    derived: 'Derived from',
    see_also: 'See also'
  };

  const relationshipColors = {
    singular: 'blue',
    plural: 'blue',
    synonym: 'green',
    antonym: 'red',
    variant: 'purple',
    derived: 'orange',
    see_also: 'gray'
  };

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <VStack spacing={4} align="start" w="100%">
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

      {/* Related Words Section */}
      {selectedWord.relatedWords && selectedWord.relatedWords.length > 0 && (
        <Box w="100%" mt={2} p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3} fontSize="sm" color="gray.600">
            Related Words:
          </Text>
          <VStack align="start" spacing={2}>
            {selectedWord.relatedWords.map((related, index) => (
              <HStack key={index} spacing={2}>
                <Badge colorScheme={relationshipColors[related.relationshipType] || 'gray'}>
                  {relationshipLabels[related.relationshipType] || related.relationshipType}
                </Badge>
                <Link
                  color="teal.500"
                  fontWeight="bold"
                  onClick={() => onWordClick && onWordClick(related.wordId)}
                  cursor="pointer"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {related.word}
                </Link>
              </HStack>
            ))}
          </VStack>
        </Box>
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