import { Container, Flex,Text, HStack, Button, useColorMode} from '@chakra-ui/react'
import React, { use } from 'react'
import { Link } from 'react-router-dom'
import { CiSquarePlus } from "react-icons/ci";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { DiAptana } from "react-icons/di";
import { IoMdLogOut } from "react-icons/io";
import { IoMdLogIn } from "react-icons/io";
import { MdUploadFile } from "react-icons/md";
import { useAuthStore } from '../store/authStore';


const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const roles = useAuthStore((state) => state.roles);
  const isSuperAdmin = roles.includes('Admin') || roles.includes('superadmin');
  
  return (
    <Container maxW="1140px" px={4} >
        <Flex h={16} 
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={
            {
                base: "column",
                sm: "row"
            }
        }
        >
           		<Text
					fontSize={{ base: "22", sm: "28" }}
					fontWeight={"bold"}
					textTransform={"uppercase"}
					textAlign={"center"}
					bgGradient={"linear(to-r, cyan.400, blue.500)"}
					bgClip={"text"}
				>
					<Link to={"/"}> Longukanu si Mbembu situ</Link>
				</Text>
                <HStack spacing={2}>
                    <Link to={"/add"}>
                        <Button>
                           <CiSquarePlus fontSize={20} />
                        </Button>
                    </Link>
                    {isSuperAdmin && (
                        <Link to={"/bulk-import"}>
                            <Button colorScheme="purple" title="Bulk Import Words">
                                <MdUploadFile fontSize={20} />
                            </Button>
                        </Link>
                    )}
                    <Button onClick={toggleColorMode}>
                        {colorMode === "light" ? <LuSun fontSize={20} /> : <IoMoon fontSize={20} />}
                    </Button>
                    <Link to={"/languages"}>
                        <Button>
                            <DiAptana fontSize={20} />
                        </Button>
                    </Link>
                    <Link to={"/logout"}>
                        <Button>
                            {isAuthenticated ? <IoMdLogOut fontSize={20} /> : <IoMdLogin fontSize={20} />}
                           
                        </Button>
                    </Link>
                   
                </HStack>
           
        </Flex>
        
    </Container>
  )
}

export default Navbar
