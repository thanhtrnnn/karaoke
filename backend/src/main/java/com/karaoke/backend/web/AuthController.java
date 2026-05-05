package com.karaoke.backend.web;

import com.karaoke.backend.domain.UserAccount;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.UserAccountRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Đăng nhập, đăng ký và đổi mật khẩu")
public class AuthController {
    private final UserAccountRepository users;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserAccountRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    @Operation(
            summary = "Đăng ký tài khoản",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "username": "client01",
                              "email": "client01@example.com",
                              "password": "secret123",
                              "role": "CLIENT"
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Đăng ký thành công",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "id": "USR-A1B2C3D4",
                              "username": "client01",
                              "email": "client01@example.com",
                              "role": "CLIENT",
                              "token": "dev-token-USR-A1B2C3D4"
                            }
                            """)))
    )
    AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        if (users.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (users.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        UserAccount user = new UserAccount(
                "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.role() == null ? UserRole.CLIENT : request.role(),
                true
        );
        users.save(user);
        return AuthResponse.from(user);
    }

    @PostMapping("/login")
    @Operation(
            summary = "Đăng nhập",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "usernameOrEmail": "admin",
                              "password": "admin123"
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Đăng nhập thành công",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "id": "USR001",
                              "username": "admin",
                              "email": "admin@karaoke.local",
                              "role": "ADMIN",
                              "token": "dev-token-USR001"
                            }
                            """)))
    )
    AuthResponse login(@Valid @RequestBody LoginRequest request) {
        UserAccount user = users.findByUsername(request.usernameOrEmail())
                .or(() -> users.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        return AuthResponse.from(user);
    }

    @PostMapping("/change-password")
    @Operation(
            summary = "Đổi mật khẩu",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "username": "admin",
                              "currentPassword": "admin123",
                              "newPassword": "newAdmin123"
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Đổi mật khẩu thành công",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "success": true
                            }
                            """)))
    )
    Map<String, Object> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        UserAccount user = users.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        users.save(user);
        return Map.of("success", true);
    }

    record RegisterRequest(
            @NotBlank String username,
            @Email String email,
            @NotBlank String password,
            UserRole role
    ) {
    }

    record LoginRequest(@NotBlank String usernameOrEmail, @NotBlank String password) {
    }

    record ChangePasswordRequest(
            @NotBlank String username,
            @NotBlank String currentPassword,
            @NotBlank String newPassword
    ) {
    }

    record AuthResponse(String id, String username, String email, UserRole role, String token) {
        static AuthResponse from(UserAccount user) {
            String token = "dev-token-" + user.getId();
            return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), token);
        }
    }
}
