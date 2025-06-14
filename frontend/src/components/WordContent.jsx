import React from 'react'

import { Text , VStack} from '@chakra-ui/react'

function WordContent({selectedWord}) {
  // prepare the content to display
  let formattedDescription="ajoute une description...";
  let originalText="";
  let translationText="";
  if(selectedWord && selectedWord.example){
    if(selectedWord.example.includes(").")){
     const parts = selectedWord.example.split(").");
     console.log("parts",parts);
     const originalLanguage= parts[0]+(").");
     const translation = parts[1].trim();
      originalText = originalLanguage; // Extract the original text
      translationText = translation; // Extract the translation text
      formattedDescription = `${originalLanguage} \n ${translation}`; // format the description
      console.log("formattedDescription",formattedDescription);
    }

  }
  return (
    <>
    <VStack>
    <Text fontWeight="bold" fontSize={"md"}>
        {selectedWord.meaning}
    </Text>
    <Text>
        {selectedWord.description!=""?selectedWord.description:"ajoute une description..."}
    </Text>
    <VStack spacing={1} align="start" mt={2} mb={2} w="100%">
      {selectedWord.example!="" && 
        <Text fontStyle="italic" >
          {originalText && originalText !== "" ? `${originalText}` : "Aucun n'example a été fourni."}
        </Text> 
      }
      {selectedWord.example!="" && 
      <Text  >
        {translationText && translationText !== "" ? `${translationText}` : ""}
      </Text>
      }

    </VStack>
 
    
    </VStack>
    </>
  )
}

export default WordContent