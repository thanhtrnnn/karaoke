package com.karaoke.backend.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Auth Controller — UC01: Đăng nhập, UC02: Đăng ký, UC03: Đổi mật khẩu")
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private void createTestUser(String id, String username, String email, String password, UserRole role) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        userRepository.save(user);
    }

    @Test
    @DisplayName("UC02 — Đăng ký thành công, trả về token và role")
    void UC02_register_success() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String username = "newuser";
                                    public final String email = "new@example.com";
                                    public final String password = "password123";
                                    public final String role = "CLIENT";
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.email").value("new@example.com"))
                .andExpect(jsonPath("$.token").value(org.hamcrest.Matchers.startsWith("dev-token-")))
                .andExpect(jsonPath("$.role").value("CLIENT"));
    }

    @Test
    @DisplayName("UC02 — Đăng ký trùng username trả 400")
    void UC02_register_duplicateUsername_returns400() throws Exception {
        createTestUser("U1", "existing", "existing@example.com", "pass123", UserRole.CLIENT);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String username = "existing";
                                    public final String email = "other@example.com";
                                    public final String password = "password123";
                                    public final String role = "CLIENT";
                                }
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Username already exists")));
    }

    @Test
    @DisplayName("UC02 — Đăng ký trùng email trả 400")
    void UC02_register_duplicateEmail_returns400() throws Exception {
        createTestUser("U2", "user2", "dup@example.com", "pass123", UserRole.CLIENT);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String username = "user3";
                                    public final String email = "dup@example.com";
                                    public final String password = "password123";
                                    public final String role = "CLIENT";
                                }
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Email already exists")));
    }

    @Test
    @DisplayName("UC02 — Đăng ký thiếu trường bắt buộc trả 400")
    void UC02_register_missingFields_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"\",\"email\":\"not-an-email\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("UC01 — Đăng nhập thành công, trả về token")
    void UC01_login_success() throws Exception {
        createTestUser("U4", "testlogin", "login@example.com", "mypassword", UserRole.ADMIN);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String usernameOrEmail = "testlogin";
                                    public final String password = "mypassword";
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("U4"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.token").value(org.hamcrest.Matchers.startsWith("dev-token-")));
    }

    @Test
    @DisplayName("UC01 — Đăng nhập sai mật khẩu trả 400")
    void UC01_login_wrongPassword_returns400() throws Exception {
        createTestUser("U5", "testuser5", "test5@example.com", "correct", UserRole.CLIENT);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String usernameOrEmail = "testuser5";
                                    public final String password = "wrong";
                                }
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    @DisplayName("UC01 — Đăng nhập user không tồn tại trả 400")
    void UC01_login_nonexistentUser_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String usernameOrEmail = "nobody";
                                    public final String password = "pass";
                                }
                        )))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("UC03 — Đổi mật khẩu thành công")
    void UC03_changePassword_success() throws Exception {
        createTestUser("U6", "changepw", "changepw@example.com", "oldpass", UserRole.CLIENT);

        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String username = "changepw";
                                    public final String currentPassword = "oldpass";
                                    public final String newPassword = "newpass123";
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("UC03 — Đổi mật khẩu sai mật khẩu hiện tại trả 400")
    void UC03_changePassword_wrongCurrent_returns400() throws Exception {
        createTestUser("U7", "changepw2", "changepw2@example.com", "oldpass", UserRole.CLIENT);

        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String username = "changepw2";
                                    public final String currentPassword = "wrong";
                                    public final String newPassword = "newpass123";
                                }
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Current password is incorrect"));
    }

    // TC03 — Mật khẩu sai 5 lần liên tiếp → khóa tài khoản (UC01 ngoại lệ)
    @Test
    @DisplayName("UC01 — TC03: Sai mật khẩu 5 lần liên tiếp khóa tài khoản, mật khẩu đúng vẫn bị từ chối")
    void UC01_wrongPassword5Times_locksAccount() throws Exception {
        createTestUser("U8", "locktest", "locktest@example.com", "correctpass", UserRole.CLIENT);

        // Sai mật khẩu 5 lần: mỗi lần trả 400 "Invalid username or password"
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new Object() {
                                        public final String usernameOrEmail = "locktest";
                                        public final String password = "wrongpass";
                                    }
                            )))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Invalid username or password"));
        }

        // Sau 5 lần sai, tài khoản bị khóa: ngay cả mật khẩu ĐÚNG cũng bị từ chối
        // với thông báo "Tài khoản đã bị khóa".
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String usernameOrEmail = "locktest";
                                    public final String password = "correctpass";
                                }
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("khóa")));
    }

    @Test
    @DisplayName("UC01 — Sai mật khẩu < 5 lần chưa khóa: đăng nhập đúng vẫn thành công")
    void UC01_wrongPasswordFewTimes_thenCorrect_succeeds() throws Exception {
        createTestUser("U9", "trytest", "trytest@example.com", "correctpass", UserRole.CLIENT);

        // Sai 4 lần (chưa đạt ngưỡng 5)
        for (int i = 1; i <= 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new Object() {
                                        public final String usernameOrEmail = "trytest";
                                        public final String password = "wrongpass";
                                    }
                            )))
                    .andExpect(status().isBadRequest());
        }

        // Mật khẩu đúng -> thành công, bộ đếm sai được reset
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String usernameOrEmail = "trytest";
                                    public final String password = "correctpass";
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }
}
