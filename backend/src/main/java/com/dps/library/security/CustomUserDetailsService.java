package com.dps.library.security;

import com.dps.library.entity.User;
import com.dps.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String enteredIdentifier = identifier == null ? "" : identifier.trim();
        final String normalizedIdentifier = enteredIdentifier.contains("@")
            ? enteredIdentifier.toLowerCase()
            : enteredIdentifier.toUpperCase();

        User user = userRepository.findByEmailOrStudentId(normalizedIdentifier)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email or student ID: " + normalizedIdentifier));

        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return UserPrincipal.create(user);
    }
}

