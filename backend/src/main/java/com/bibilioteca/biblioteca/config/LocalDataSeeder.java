/**
 * Carrega dados de exemplo quando o perfil local esta ativo, facilitando testes e demonstracoes.
 */
package com.bibilioteca.biblioteca.config;

import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.bibilioteca.biblioteca.model.Emprestimo;
import com.bibilioteca.biblioteca.model.EmprestimoStatus;
import com.bibilioteca.biblioteca.model.Livro;
import com.bibilioteca.biblioteca.model.Usuario;
import com.bibilioteca.biblioteca.repository.EmprestimoRepository;
import com.bibilioteca.biblioteca.repository.LivroRepository;
import com.bibilioteca.biblioteca.repository.UsuarioRepository;

@Configuration
@Profile("local")
public class LocalDataSeeder {

    @Bean
    CommandLineRunner seedData(
            LivroRepository livroRepository,
            UsuarioRepository usuarioRepository,
            EmprestimoRepository emprestimoRepository
    ) {
        return args -> {
            if (livroRepository.count() > 0 || usuarioRepository.count() > 0 || emprestimoRepository.count() > 0) {
                return;
            }

            Livro livro1 = criarLivro(
                "Dom Casmurro",
                "Machado de Assis",
                "9780000000011",
                "Literatura",
                "Bentinho narra sua historia de amor com Capitu e suas desconfianças em uma narrativa marcada por memoria e ambiguidade.",
                1899,
                5,
                4
            );
            Livro livro2 = criarLivro(
                "Clean Code",
                "Robert C. Martin",
                "9780000000028",
                "Tecnologia",
                "Guia pratico para escrever codigo limpo, legivel e de facil manutencao em equipes de desenvolvimento.",
                2008,
                3,
                2
            );
            Livro livro3 = criarLivro(
                "O Pequeno Principe",
                "Antoine de Saint-Exupery",
                "9780000000035",
                "Infantil",
                "Classico sobre amizade, imaginacao e o essencial invisivel aos olhos, contado por um pequeno viajante.",
                1943,
                4,
                4
            );
            Livro livro4 = criarLivro(
                "Estruturas de Dados em Java",
                "N. Goodrich",
                "9780000000042",
                "Educacao",
                "Apresenta estruturas fundamentais e tecnicas de algoritmos com foco em resolucao de problemas.",
                2014,
                2,
                1
            );
            Livro livro5 = criarLivro(
                "1984",
                "George Orwell",
                "9780000000059",
                "Ficcao",
                "Distopia sobre vigilancia estatal extrema e manipulacao da verdade em uma sociedade autoritaria.",
                1949,
                6,
                5
            );
            Livro livro6 = criarLivro(
                "Memorias Postumas de Bras Cubas",
                "Machado de Assis",
                "9780000000066",
                "Literatura",
                "Narrado por um defunto-autor, o romance ironiza costumes sociais e questiona valores da elite.",
                1881,
                4,
                3
            );
            Livro livro7 = criarLivro(
                "Refatoracao",
                "Martin Fowler",
                "9780000000073",
                "Tecnologia",
                "Catalogo de melhorias estruturais para evoluir codigo sem alterar comportamento externo.",
                2018,
                3,
                1
            );
            Livro livro8 = criarLivro(
                "A Revolucao dos Bichos",
                "George Orwell",
                "9780000000080",
                "Ficcao",
                "Fabula politica sobre poder, manipulacao e desigualdade apresentada em uma fazenda.",
                1945,
                5,
                4
            );
            List<Livro> livros = livroRepository.saveAll(List.of(livro1, livro2, livro3, livro4, livro5, livro6, livro7, livro8));

            Usuario usuario1 = criarUsuario("Ana Paula Lima", "ana.lima@escola.local", "11111111111", "(11) 99111-1111");
            Usuario usuario2 = criarUsuario("Bruno Costa", "bruno.costa@escola.local", "22222222222", "(11) 99222-2222");
            Usuario usuario3 = criarUsuario("Carlos Souza", "carlos.souza@escola.local", "33333333333", "(11) 99333-3333");
            Usuario usuario4 = criarUsuario("Daniela Rocha", "daniela.rocha@escola.local", "44444444444", "(11) 99444-4444");
            Usuario usuario5 = criarUsuario("Eduardo Nunes", "eduardo.nunes@escola.local", "55555555555", "(11) 99555-5555");
            List<Usuario> usuarios = usuarioRepository.saveAll(List.of(usuario1, usuario2, usuario3, usuario4, usuario5));

            Emprestimo e1 = criarEmprestimo(
                    livros.get(0),
                    usuarios.get(0),
                    LocalDate.now().minusDays(10),
                    LocalDate.now().minusDays(3),
                    null,
                    EmprestimoStatus.ATIVO
            );

            Emprestimo e2 = criarEmprestimo(
                    livros.get(1),
                    usuarios.get(1),
                    LocalDate.now().minusDays(4),
                    LocalDate.now().plusDays(3),
                    null,
                    EmprestimoStatus.ATIVO
            );

            Emprestimo e3 = criarEmprestimo(
                    livros.get(3),
                    usuarios.get(2),
                    LocalDate.now().minusDays(15),
                    LocalDate.now().minusDays(8),
                    LocalDate.now().minusDays(6),
                    EmprestimoStatus.DEVOLVIDO
            );

                Emprestimo e4 = criarEmprestimo(
                    livros.get(6),
                    usuarios.get(3),
                    LocalDate.now().minusDays(12),
                    LocalDate.now().minusDays(2),
                    null,
                    EmprestimoStatus.ATIVO
                );

                Emprestimo e5 = criarEmprestimo(
                    livros.get(4),
                    usuarios.get(4),
                    LocalDate.now().minusDays(2),
                    LocalDate.now().plusDays(5),
                    null,
                    EmprestimoStatus.ATIVO
                );

                emprestimoRepository.saveAll(List.of(e1, e2, e3, e4, e5));
        };
    }

    private Livro criarLivro(
            String titulo,
            String autor,
            String isbn,
            String categoria,
            String sinopse,
            Integer ano,
            Integer total,
            Integer disponivel
    ) {
        Livro livro = new Livro();
        livro.setTitulo(titulo);
        livro.setAutor(autor);
        livro.setIsbn(isbn);
        livro.setCategoria(categoria);
        livro.setSinopse(sinopse);
        livro.setAnoPublicacao(ano);
        livro.setQuantidadeTotal(total);
        livro.setQuantidadeDisponivel(disponivel);
        return livro;
    }

    private Usuario criarUsuario(String nome, String email, String documento, String telefone) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setDocumento(documento);
        usuario.setTelefone(telefone);
        return usuario;
    }

    private Emprestimo criarEmprestimo(
            Livro livro,
            Usuario usuario,
            LocalDate dataEmprestimo,
            LocalDate prevista,
            LocalDate devolucao,
            EmprestimoStatus status
    ) {
        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setLivro(livro);
        emprestimo.setUsuario(usuario);
        emprestimo.setDataEmprestimo(dataEmprestimo);
        emprestimo.setDataPrevistaDevolucao(prevista);
        emprestimo.setDataDevolucao(devolucao);
        emprestimo.setStatus(status);
        return emprestimo;
    }
}
