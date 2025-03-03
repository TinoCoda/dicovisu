import React from 'react'

import { VStack } from '@chakra-ui/react'

import WordTitle from '../components/WordTitle'
import WordContent from '../components/WordContent'

function DetailPage({selectedWord}) {
  return (
   <VStack p={2}>
    <WordTitle word={selectedWord.word} />
    <WordContent selectedWord={selectedWord} />
   </VStack>
  )
}

export default DetailPage