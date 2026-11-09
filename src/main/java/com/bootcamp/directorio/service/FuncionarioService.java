package com.bootcamp.directorio.service;

import com.bootcamp.directorio.model.Funcionario;
import com.bootcamp.directorio.repository.FuncionarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FuncionarioService {

    private final FuncionarioRepository repository;

    public FuncionarioService(FuncionarioRepository repository) {
        this.repository = repository;
    }

    public List<Funcionario> listar(String nombre, String departamento) {
        // Los filtros vacíos o con solo espacios se tratan como ausentes
        boolean hayNombre = nombre != null && !nombre.isBlank();
        boolean hayDepto = departamento != null && !departamento.isBlank();

        if (hayNombre) {
            return repository.findByNombreContainingIgnoreCase(nombre.trim());
        }
        if (hayDepto) {
            return repository.findByDepartamentoIgnoreCase(departamento.trim());
        }
        return repository.findAll();
    }

    public Optional<Funcionario> obtener(Long id) {
        return repository.findById(id);
    }

    public Funcionario crear(Funcionario f) {
        f.setId(null);
        normalizar(f);
        return repository.save(f);
    }

    public Optional<Funcionario> actualizar(Long id, Funcionario datos) {
        return repository.findById(id).map(existente -> {
            existente.setNombre(datos.getNombre());
            existente.setCargo(datos.getCargo());
            existente.setDepartamento(datos.getDepartamento());
            existente.setTelefono(datos.getTelefono());
            normalizar(existente);
            return repository.save(existente);
        });
    }

    public boolean eliminar(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    private void normalizar(Funcionario f) {
        f.setNombre(f.getNombre().trim());
        f.setCargo(f.getCargo().trim());
        f.setDepartamento(f.getDepartamento().trim());
        if (f.getTelefono() != null) {
            String t = f.getTelefono().trim();
            f.setTelefono(t.isEmpty() ? null : t);
        }
    }
}