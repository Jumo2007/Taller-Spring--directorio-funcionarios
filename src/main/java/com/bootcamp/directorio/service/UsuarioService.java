package com.bootcamp.directorio.service;

import com.bootcamp.directorio.model.Usuario;
import com.bootcamp.directorio.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    // Devuelve vacío si el usuario ya existe
    public Optional<Usuario> registrar(String username, String password) {
        String nombre = username.trim();
        if (repository.existsByUsernameIgnoreCase(nombre)) {
            return Optional.empty();
        }
        Usuario nuevo = new Usuario();
        nuevo.setUsername(nombre);
        nuevo.setPassword(encoder.encode(password));
        return Optional.of(repository.save(nuevo));
    }

    public boolean autenticar(String username, String password) {
        return repository.findByUsernameIgnoreCase(username.trim())
                .map(u -> encoder.matches(password, u.getPassword()))
                .orElse(false);
    }
}