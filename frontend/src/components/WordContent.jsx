import React from 'react'

import { Text , VStack} from '@chakra-ui/react'

function WordContent({selectedWord}) {
  return (
    <>
    <VStack>
    <Text color="black" fontWeight="bold" fontSize={"md"}>
        {selectedWord.meaning}
    </Text>
    <Text>
        {selectedWord.description!=""?selectedWord.description:"ajoute une description..."}
    </Text>
    <Text>
        {selectedWord.example}
    </Text>

    
    </VStack>
    </>
  )
}

export default WordContent