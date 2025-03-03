import React from 'react'
import { useState } from 'react'

import { Box, Container, Text, VStack ,Heading, useColorModeValue, Input, Button, useToast} from "@chakra-ui/react"
import { useWordStore } from '../store/words'

function AddNewEntry() {
  const [newWord, setNewWord] = useState({
    word: "",
    meaning: "",
    language:"",
    description: "",
    example: "",

  }); 

  const toast = useToast();
  const { addWord } = useWordStore();

  const handleAddWord = async () => {

    const { success, message } = await addWord(newWord);
    setNewWord({
      word: "",
      meaning: "",
      language:"",
      description: "",
      example: "",
    });
    console.log(success, message);

    if(success){
      toast({
        title: "Word added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed to add word",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    console.log(newWord);
  }

  
  return (
    <>
    <div>AddNewEntry</div>
    <Container maxW={"container.sm"}>
      <VStack spacing={8}
      >
        <Heading as="h1" size="2xl" textAlign={"center"} mb={8} >
            Add a New Word
        </Heading>
        <Box w={"full"} bg={useColorModeValue("white", "gray.800")} p={6} rounded={"lg"} shadow={"md"} >
                 <Text fontSize="xl">Creating a New Entry</Text>
                 <VStack spacing={4}>
                    <Input 
                        placeholder="Word"
                        name="name"
                        value={newWord.word}
                        onChange={(e) => setNewWord({...newWord, name: e.target.value})}
                    />
                    <Input 
                        placeholder="Meaning"
                        name="meaning"
                        value={newWord.meaning}
                        onChange={(e) => setNewWord({...newWord, price: e.target.value})}
                    />
                    <Input 
                        placeholder="Language"
                        name="language"
                        value={newWord.language}
                        onChange={(e) => setNewWord({...newWord, image: e.target.value})}
                    />
                    <Input 
                        placeholder="Description"
                        name="description"
                        value={newWord.description}
                        onChange={(e) => setNewWord({...newWord, image: e.target.value})}
                    />
                    <Input 
                        placeholder="Example"
                        name="example"
                        value={newWord.example}
                        onChange={(e) => setNewWord({...newWord, image: e.target.value})} 
                    />
                    
                    <Button
                        colorScheme="teal"
                        onClick={handleAddWord}
                        w={"full"}
                        
                    >
                        Add Word
                    </Button>
                </VStack>
                 
            

            </Box>


      </VStack>

    </Container>

    </>
    

  )
}

export default AddNewEntry