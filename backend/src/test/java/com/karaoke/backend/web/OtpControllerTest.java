package com.karaoke.backend.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.karaoke.backend.domain.Otp;
import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.OtpRepository;
import com.karaoke.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("OTP Controller — UC02: gửi và xác thực OTP")
class OtpControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private OtpRepository otpRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private User createUser(String id, String username, String email) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole(UserRole.CLIENT);
        user.setActive(true);
        return userRepository.save(user);
    }

    /** Gửi OTP và trả về mã OTP nhận được. */
    private String sendOtp(String identifier) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SendBody(identifier, "REGISTER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.otpCode").exists())
                .andExpect(jsonPath("$.expiresAt").exists())
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("otpCode").asText();
    }

    @Test
    @DisplayName("UC02 — Gửi OTP trả về mã và thời hạn")
    void sendOtp_returnsCodeAndExpiry() throws Exception {
        createUser("OU1", "otpuser1", "otp1@example.com");
        String code = sendOtp("otp1@example.com");
        org.junit.jupiter.api.Assertions.assertNotNull(code);
        org.junit.jupiter.api.Assertions.assertEquals(6, code.length());
    }

    @Test
    @DisplayName("UC02 — Gửi OTP gắn OTP với User tương ứng (email)")
    void sendOtp_linksOtpToUser() throws Exception {
        User user = createUser("OU2", "otpuser2", "otp2@example.com");
        sendOtp("otp2@example.com");

        java.util.List<Otp> linked = otpRepository.findByUser(user);
        org.junit.jupiter.api.Assertions.assertFalse(linked.isEmpty(),
                "OTP phải được gắn với user khi gửi bằng email của user");
    }

    @Test
    @DisplayName("UC02 — Xác thực OTP đúng mã + đúng user trả verified=true")
    void verifyOtp_correctCodeForUser_returnsTrue() throws Exception {
        createUser("OU3", "otpuser3", "otp3@example.com");
        String code = sendOtp("otp3@example.com");

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new VerifyBody(code, "otp3@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true));
    }

    @Test
    @DisplayName("UC02 — Xác thực OTP sai mã trả verified=false")
    void verifyOtp_wrongCode_returnsFalse() throws Exception {
        createUser("OU4", "otpuser4", "otp4@example.com");
        sendOtp("otp4@example.com");

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new VerifyBody("000000", "otp4@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(false));
    }

    @Test
    @DisplayName("UC02 — Mã OTP của user A không xác thực được cho user B")
    void verifyOtp_codeScopedToOwningUser() throws Exception {
        createUser("OU5A", "otpuserA", "otpA@example.com");
        User userB = createUser("OU5B", "otpuserB", "otpB@example.com");
        // Đảm bảo user B chưa có OTP nào.
        org.junit.jupiter.api.Assertions.assertTrue(otpRepository.findByUser(userB).isEmpty());

        // Gửi OTP cho user A và lấy mã của A.
        String codeA = sendOtp("otpA@example.com");

        // Dùng mã của A nhưng định danh user B -> không verify được (mã không thuộc B).
        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new VerifyBody(codeA, "otpB@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(false));
    }

    record SendBody(String phoneNumberOrEmail, String type) {}
    record VerifyBody(String otpCode, String phoneNumberOrEmail) {}
}
