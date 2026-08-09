import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Tooltip,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  FormControl,
  FormHelperText,
} from '@chakra-ui/react';
import { MdLockReset } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isSuperAdmin } from '../utils/roles';
import { useFetchUsersEndpoint, useUpdateUserRolesEndpoint, useUpdateUserPasswordEndpoint } from '../features/users/userApi';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const roles = useAuthStore((state) => state.roles);
  const currentUsername = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin(roles)) {
      toast({
        title: 'Access Denied',
        description: 'Only admins can manage users.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
      return;
    }

    fetchUsers();
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await useFetchUsersEndpoint();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    setUpdatingId(user._id);
    try {
      const updated = await useUpdateUserRolesEndpoint(user._id, [newRole]);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, roles: updated.roles } : u)));
      toast({
        title: 'Role updated',
        description: `${user.username} is now ${newRole}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to update role',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const openResetModal = (user) => {
    setResetTarget(user);
    setNewPassword('');
  };

  const closeResetModal = () => {
    setResetTarget(null);
    setNewPassword('');
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Use at least 6 characters.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsResetting(true);
    try {
      await useUpdateUserPasswordEndpoint(resetTarget._id, newPassword);
      toast({
        title: 'Password reset',
        description: `${resetTarget.username} can now log in with the new password.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      closeResetModal();
    } catch (error) {
      toast({
        title: 'Failed to reset password',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8}>
          <Spinner size="xl" color="blue.400" />
          <Text color="text-muted">Loading users...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading fontFamily="heading" size="lg" color="text-primary">
            Manage Users
          </Heading>
          <Text color="text-muted" fontSize="sm">
            Only an existing admin can promote someone else — new sign-ups always start as a learner.
          </Text>
        </Box>

        <Box
          bg="bg-surface"
          border="1px solid"
          borderColor="border-default"
          borderRadius="lg"
          overflowX="auto"
        >
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th color="text-muted">Username</Th>
                <Th color="text-muted">Name</Th>
                <Th color="text-muted">Roles</Th>
                <Th color="text-muted">Joined</Th>
                <Th color="text-muted">Role</Th>
                <Th color="text-muted">Password</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => {
                const isSelf = user.username === currentUsername;
                const currentlyAdmin = isSuperAdmin(user.roles || []);
                return (
                  <Tr key={user._id}>
                    <Td fontWeight="medium" color="text-primary">{user.username}</Td>
                    <Td color="text-muted">{user.name || '—'}</Td>
                    <Td>
                      {(user.roles || []).map((role) => (
                        <Badge key={role} colorScheme={role === 'superadmin' ? 'blue' : 'gray'} mr={1}>
                          {role}
                        </Badge>
                      ))}
                    </Td>
                    <Td color="text-muted">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </Td>
                    <Td>
                      <Tooltip label={isSelf ? "You can't change your own admin role" : ''} isDisabled={!isSelf}>
                        <Select
                          size="sm"
                          w="140px"
                          value={currentlyAdmin ? 'superadmin' : 'learner'}
                          isDisabled={isSelf || updatingId === user._id}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          bg="bg-canvas"
                          borderColor="border-default"
                        >
                          <option value="learner">learner</option>
                          <option value="superadmin">superadmin</option>
                        </Select>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label="Reset this user's password">
                        <IconButton
                          aria-label={`Reset password for ${user.username}`}
                          icon={<MdLockReset />}
                          size="sm"
                          variant="ghost"
                          colorScheme="orange"
                          onClick={() => openResetModal(user)}
                        />
                      </Tooltip>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <Modal isOpen={!!resetTarget} onClose={closeResetModal} isCentered>
        <ModalOverlay />
        <ModalContent bg="bg-surface" borderColor="border-default" borderWidth="1px">
          <ModalHeader color="text-primary">
            Reset password for {resetTarget?.username}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                bg="bg-canvas"
                borderColor="border-default"
              />
              <FormHelperText color="text-muted">
                At least 6 characters. Share it with {resetTarget?.username} directly — they'll be able to log in with it immediately.
              </FormHelperText>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={closeResetModal}>Cancel</Button>
              <Button colorScheme="orange" onClick={handleResetPassword} isLoading={isResetting}>
                Reset Password
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ManageUsers;
