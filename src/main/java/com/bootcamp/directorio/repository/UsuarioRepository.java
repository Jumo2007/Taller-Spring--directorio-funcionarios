package com.bootcamp.directorio.repository;

import com.bootcamp.directorio.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByUsernameIgnoreCase(String username);

    Optional<Usuario> findByUsernameIgnoreCase(String username);
}