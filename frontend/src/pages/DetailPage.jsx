import React from 'react'

import { VStack } from '@chakra-ui/react'

import WordTitle from '../components/WordTitle'
import WordContent from '../components/WordContent'

import { useWordStore } from '../store/words'

function DetailPage() {
  const { selectedWord } = useWordStore()
  
  console.log("selectedWord",selectedWord)
  return (
   <VStack p={2}>
    <WordTitle word={selectedWord.word} />
    <WordContent selectedWord={selectedWord} />
   </VStack>
  )
}

export default DetailPage