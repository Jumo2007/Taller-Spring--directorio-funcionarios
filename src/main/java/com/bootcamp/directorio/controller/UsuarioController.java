package com.bootcamp.directorio.controller;

import com.bootcamp.directorio.model.Usuario;
import com.bootcamp.directorio.service.UsuarioService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    public record RegistroRequest(
            @NotBlank @Size(min = 4, max = 30) String username,
            @NotBlank @Size(min = 6, max = 72) String password) {}

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password) {}

    public record UsuarioResponse(Long id, String username) {}

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroRequest req) {
        Optional<Usuario> creado = service.registrar(req.username(), req.password());
        if (creado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensaje", "Ese nombre de usuario ya existe."));
        }
        Usuario u = creado.get();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UsuarioResponse(u.getId(), u.getUsername()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        if (service.autenticar(req.username(), req.password())) {
            return ResponseEntity.ok(Map.of("mensaje", "Inicio de sesión exitoso."));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("mensaje", "Usuario o contraseña incorrectos."));
    }
}