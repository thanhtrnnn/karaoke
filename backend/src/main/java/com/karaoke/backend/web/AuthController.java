package com.karaoke.backend.web;

import com.karaoke.backend.domain.Client;
import com.karaoke.backend.domain.LoginSession;
import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.ClientRepository;
import com.karaoke.backend.repository.LoginSessionRepository;
import com.karaoke.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Đăng nhập, đăng ký và đổi mật khẩu")
public class AuthController {
    /** Account UC01 ngoại lệ: số lần đăng nhập sai tối đa trước khi khóa. */
    private static final int MAX_FAILED_ATTEMPTS = 5;
    /** Account UC01 ngoại lệ: thời gian khóa tài khoản (phút). */
    private static final int LOCK_DURATION_MINUTES = 15;

    private final UserRepository users;
    private final ClientRepository clients;
    private final LoginSessionRepository loginSessions;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository users, ClientRepository clients,
                          LoginSessionRepository loginSessions,
                          PasswordEncoder passwordEncoder) {
        this.users = users;
        this.clients = clients;
        this.loginSessions = loginSessions;
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

        User user = new User(
                "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                UserRole.CLIENT,
                true,
                request.fullName(), request.phoneNumber(), LocalDateTime.now()
        );
        users.save(user);
        return buildResponse(user);
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
        User user = users.findByUsername(request.usernameOrEmail())
                .or(() -> users.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        // Account UC01 ngoại lệ (TC03): tài khoản đang bị khóa -> từ chối đăng nhập
        if (user.isLocked()) {
            throw new IllegalArgumentException("Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            // Account UC01 ngoại lệ: tăng số lần sai, khóa 15 phút khi đạt 5 lần
            user.incrementFailedAttempts();
            if (user.getFailedAttempts() != null && user.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.lockAccount(LOCK_DURATION_MINUTES);
            }
            users.save(user);
            throw new IllegalArgumentException("Invalid username or password");
        }

        // Đăng nhập thành công: reset bộ đếm sai + bỏ khóa
        user.setFailedAttempts(0);
        user.setLockUntil(null);
        users.save(user);

        // Ghi 1 phiên đăng nhập (Account diagram: LoginSession)
        String token = "dev-token-" + user.getId();
        LocalDateTime now = LocalDateTime.now();
        LoginSession session = new LoginSession();
        session.setSessionToken(token);
        session.setLoginTime(now);
        session.setExpiresAt(now.plusHours(12));
        session.setDevice("web");
        session.setTrangThai("Hoạt động");
        session.setUser(user);
        loginSessions.save(session);

        return buildResponse(user);
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
        User user = users.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        users.save(user);

        // Account TC07: đổi mật khẩu thành công -> thu hồi tất cả phiên cũ của user
        List<LoginSession> sessions = loginSessions.findByUser(user);
        for (LoginSession session : sessions) {
            session.setTrangThai("Đã thu hồi");
        }
        loginSessions.saveAll(sessions);

        return Map.of("success", true);
    }

    @PutMapping("/profile")
    @Operation(
            summary = "Cập nhật hồ sơ",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "username": "admin",
                              "fullName": "Quản trị viên",
                              "email": "admin@karaoke.local"
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Cập nhật hồ sơ thành công",
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
    AuthResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = users.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.email() != null) {
            // Account UC03 (cập nhật hồ sơ): không cho trùng email với tài khoản khác
            if (!request.email().equals(user.getEmail()) && users.existsByEmail(request.email())) {
                throw new IllegalArgumentException("Email đã được sử dụng");
            }
            user.setEmail(request.email());
        }
        users.save(user);
        return buildResponse(user);
    }

    record RegisterRequest(
            @NotBlank String username,
            @Email String email,
            @NotBlank @Size(min = 8) String password,
            UserRole role,
            // Account UC02: tùy chọn (nullable) để các caller cũ vẫn hợp lệ
            String fullName,
            String phoneNumber
    ) {}

    record LoginRequest(@NotBlank String usernameOrEmail, @NotBlank String password) {}

    record ChangePasswordRequest(
            @NotBlank String username,
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8) String newPassword
    ) {}

    record UpdateProfileRequest(
            @NotBlank String username,
            String fullName,
            @Email String email
    ) {}

    /**
     * Phản hồi xác thực. membershipTier + loyaltyPoints (Account UC04) chỉ có
     * khi User tương ứng một Client (thành viên); ngược lại để null.
     */
    record AuthResponse(String id, String username, String email, UserRole role, String token,
                        String membershipTier, Integer loyaltyPoints) {
        static AuthResponse from(User user) {
            return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                    "dev-token-" + user.getId(), null, null);
        }
    }

    /** Tạo AuthResponse và gắn thêm hạng hội viên + điểm tích lũy nếu User là một Client. */
    private AuthResponse buildResponse(User user) {
        Client client = findClientForUser(user);
        String tier = client != null ? client.getTier() : null;
        Integer points = client != null ? client.getLoyaltyPoints() : null;
        return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                "dev-token-" + user.getId(), tier, points);
    }

    /** Tìm Client tương ứng User: theo phoneNumber trước, sau đó dò trùng email. */
    private Client findClientForUser(User user) {
        if (user.getPhoneNumber() != null) {
            Optional<Client> byPhone = clients.findByPhone(user.getPhoneNumber());
            if (byPhone.isPresent()) {
                return byPhone.get();
            }
        }
        if (user.getEmail() != null) {
            return clients.findAll().stream()
                    .filter(c -> user.getEmail().equalsIgnoreCase(c.getEmail()))
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }
}
