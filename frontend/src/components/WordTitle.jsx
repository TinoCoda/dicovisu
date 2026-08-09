import React from 'react'
import { Text, VStack, Box } from '@chakra-ui/react'

const WordTitle = ({ word }) => {
    return (
        <VStack spacing={2}>
            <Text
                fontFamily="heading"
                fontWeight="600"
                fontSize={{ base: "3xl", md: "5xl" }}
                color="text-primary"
                lineHeight="1.1"
            >
                {word}
            </Text>
            <Box w="48px" h="2px" bg="blue.400" borderRadius="full" />
        </VStack>
    )
}

export default WordTitle
