import React from 'react'
import { Text } from '@chakra-ui/react'

const WordTitle = ({ word }) => {
    return (
        <Text  fontWeight="bold" fontSize={"md"}>
            {word}
        </Text>
    )
}

export default WordTitle