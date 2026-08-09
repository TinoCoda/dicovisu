import React from 'react';
import { Text, VStack, HStack, Link, Badge, Box, Icon } from '@chakra-ui/react';
import { FaPlay, FaVolumeUp } from 'react-icons/fa';

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
    see_also: 'See also',
    infinitive: 'Infinitive'
  };

  const relationshipColors = {
    singular: 'blue',
    plural: 'blue',
    synonym: 'green',
    antonym: 'red',
    variant: 'purple',
    derived: 'orange',
    see_also: 'gray',
    infinitive: 'teal'
  };

  return (
    <VStack spacing={4} align="start" w="100%">
      <Text fontStyle="italic" align="left" color="text-muted" fontSize="sm">
        Language(s): {selectedWord.language.join(', ')}
      </Text>
      <Text fontWeight="600" fontSize="lg" color="text-primary">
        {selectedWord.meaning}
      </Text>
      {selectedWord.translations && selectedWord.translations.length > 0 && (
        <Text fontStyle="italic" color="text-muted">
          Translations: {selectedWord.translations.join(', ')}
        </Text>
      )}

      {/* Audio Pronunciation Section */}
      {selectedWord.audio?.filename && (
        <Box
          w="100%"
          mt={2}
          p={{ base: 3, md: 4 }}
          bg="bg-surface-raised"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="teal.400"
          borderLeftWidth="4px"
        >
          <VStack spacing={2} align="stretch">
            <HStack spacing={2}>
              <Icon as={FaVolumeUp} color="teal.400" boxSize={{ base: 4, md: 5 }} />
              <Text fontWeight="bold" fontSize={{ base: 'xs', md: 'sm' }} color="text-muted" textTransform="uppercase" letterSpacing="wide">
                Pronunciation
              </Text>
            </HStack>
            <Box w="100%">
              <audio
                src={selectedWord.audio.url || `/uploads/audio/${selectedWord.audio.filename}`}
                controls
                style={{
                  width: '100%',
                  height: '40px',
                  minHeight: '40px'
                }}
              />
            </Box>
          </VStack>
        </Box>
      )}

      {/* Related Words Section */}
      {selectedWord.relatedWords && selectedWord.relatedWords.length > 0 && (
        <Box w="100%" mt={2} p={4} bg="bg-surface-raised" borderRadius="md" borderWidth="1px" borderColor="border-default">
          <Text fontWeight="bold" mb={3} fontSize="sm" color="text-muted" textTransform="uppercase" letterSpacing="wide">
            Related Words
          </Text>
          <VStack align="start" spacing={2}>
            {selectedWord.relatedWords.map((related, index) => (
              <HStack key={index} spacing={2}>
                <Badge colorScheme={relationshipColors[related.relationshipType] || 'gray'}>
                  {relationshipLabels[related.relationshipType] || related.relationshipType}
                </Badge>
                <Link
                  color="blue.400"
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

      <Text color="text-primary">
        {selectedWord.description !== '' ? selectedWord.description : 'ajoute une description...'}
      </Text>
      <VStack spacing={4} align="start" mt={4} mb={4} w="100%">
        {translations.length > 0 ? (
          translations.map((pair, index) => (
            <React.Fragment key={index}>
              <Text fontStyle="italic" fontWeight="bold" color="text-primary">
                {pair.originalText}
              </Text>
              <Text color="text-muted">{pair.translation}</Text>
            </React.Fragment>
          ))
        ) : (
          <Text color="text-muted">Aucun exemple n'a été fourni.</Text>
        )}
      </VStack>
    </VStack>
  );
}

export default WordContent;