import { Container, Flex, Text, HStack, Button, IconButton, Tooltip, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'
import { CiSquarePlus } from "react-icons/ci";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { DiAptana } from "react-icons/di";
import { IoMdLogOut } from "react-icons/io";
import { IoMdLogIn } from "react-icons/io";
import { MdUploadFile, MdManageAccounts } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";
import { useAuthStore } from '../store/authStore';
import { isSuperAdmin } from '../utils/roles';
import DikengaMark from './DikengaMark';

const NavIconButton = ({ label, colorScheme = "gray", ...rest }) => (
  <Tooltip label={label} hasArrow openDelay={300}>
    <IconButton
      aria-label={label}
      variant="ghost"
      colorScheme={colorScheme}
      fontSize="18px"
      {...rest}
    />
  </Tooltip>
);

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const roles = useAuthStore((state) => state.roles);
  const isAdmin = isSuperAdmin(roles);

  return (
    <Flex
      as="header"
      position="sticky"
      top={0}
      zIndex={10}
      bg="bg-surface"
      borderBottom="1px solid"
      borderColor="border-default"
      backdropFilter="blur(8px)"
    >
      <Container maxW="1140px" px={4}>
        <Flex
          minH={16}
          h={{ base: "auto", sm: 16 }}
          py={{ base: 3, sm: 0 }}
          alignItems={"center"}
          justifyContent={"space-between"}
          flexDir={{ base: "column", sm: "row" }}
          gap={{ base: 3, sm: 0 }}
        >
          <Link to={"/"}>
            <HStack spacing={2.5}>
              <DikengaMark boxSize="26px" color="blue.400" />
              <Flex direction="column" lineHeight="1.1">
                <Text
                  as="span"
                  fontFamily="heading"
                  fontSize={{ base: "19", sm: "21" }}
                  fontWeight="600"
                  color="text-primary"
                >
                  Longukanu
                </Text>
                <Text
                  as="span"
                  fontSize="10"
                  letterSpacing="0.14em"
                  textTransform="uppercase"
                  color="text-muted"
                >
                  si Mbembu situ
                </Text>
              </Flex>
            </HStack>
          </Link>

          <HStack spacing={1}>
            <Link to={"/add"}>
              <NavIconButton label="Add a word" colorScheme="blue" icon={<CiSquarePlus />} />
            </Link>
            {isAdmin && (
              <Link to={"/bulk-import"}>
                <NavIconButton label="Bulk import words" colorScheme="teal" icon={<MdUploadFile />} />
              </Link>
            )}
            {isAdmin && (
              <Link to={"/users"}>
                <NavIconButton label="Manage users" colorScheme="purple" icon={<MdManageAccounts />} />
              </Link>
            )}
            {isAuthenticated && (
              <Link to={"/statistics"}>
                <NavIconButton label="Dictionary statistics" colorScheme="indigo" icon={<IoStatsChart />} />
              </Link>
            )}
            <NavIconButton
              label={colorMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              onClick={toggleColorMode}
              icon={colorMode === "light" ? <LuSun /> : <IoMoon />}
            />
            <Link to={"/languages"}>
              <NavIconButton label="Manage languages" icon={<DiAptana />} />
            </Link>
            <Link to={"/logout"}>
              <NavIconButton
                label={isAuthenticated ? "Log out" : "Log in"}
                icon={isAuthenticated ? <IoMdLogOut /> : <IoMdLogIn />}
              />
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Flex>
  )
}

export default Navbar
